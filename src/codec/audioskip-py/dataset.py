import itertools
import json
import os
import pickle

import librosa
import numpy as np
import scipy.io.wavfile as wf
import sklearn.model_selection

import util

# 波形切段的时长
SEGMENT_DURATION = 5
# 波形切段多久切一次
SEGMENT_STRIDE_DURATION = 3
# 原始样本的目录
SAMPLE_DIR_PATH = 'G:\\userjs\\bilitwin\\src\\codec\\audioskip-py\\samples'
# 波形切段保存路径
DATASET_DIR_PATH = 'G:\\userjs\\bilitwin\\src\\codec\\audioskip-py\\dataset'
# 特征保存路径
MODEL_INPUT_PATH = 'G:\\userjs\\bilitwin\\src\\codec\\audioskip-py\\model_input.pickle'
# 有哪些类
CLASS_NAMES = ['negative', 'positive']
# 提取哪些特征
USED_FEATURES = set(['spectro', 'melspectro', 'contrast', 'mfcc'])

log = util.Log()
log_pop = log.pop
log_push = log.push
log = log.log


def max_multiple_leqt(a, m):
    '''
    返回小于等于`m`的`a`的最大倍数
    '''
    return m - m % a


def gen_segments(signal, sample_rate, segment_duration=SEGMENT_DURATION, segment_stride_duration=SEGMENT_STRIDE_DURATION):
    '''
    将波形切分为时长为`segment_duration`的小段，小段之间的重叠时长为`segment_stride_duration`
    '''
    segment_width = segment_duration * sample_rate
    segment_stride = segment_stride_duration * sample_rate

    for i in range(0, len(signal) + 1 - segment_width, segment_stride):
        yield signal[i:i + segment_width]


def gen_dataset(sample_dir_path=SAMPLE_DIR_PATH, dataset_dir_path=DATASET_DIR_PATH, segment_duration=SEGMENT_DURATION, segment_stride_duration=SEGMENT_STRIDE_DURATION):
    '''
    从`sample_dir_path`读取波形，将波形切分为小段，保存到`dataset_dir_path`
    '''
    os.makedirs(dataset_dir_path, exist_ok=True)

    with open(f'{sample_dir_path}\\inoutro.json') as f:
        inoutro = json.load(f)

    for (sample_name, [intro_start_time, intro_end_time]) in inoutro.items():
        log(f'spliting {sample_name}, intro_start_time={intro_start_time}, intro_end_time={intro_end_time}')
        (signal, sample_rate) = librosa.load(f'{SAMPLE_DIR_PATH}\\{sample_name}')

        # pylint: disable=E0632
        (before_intro_split, intro_split, after_intro_split) = np.split(signal, (intro_start_time * sample_rate, intro_end_time * sample_rate))

        os.makedirs(f'{dataset_dir_path}\\{sample_name}\\positive', exist_ok=True)
        os.makedirs(f'{dataset_dir_path}\\{sample_name}\\negative', exist_ok=True)

        for (i, segment) in zip(itertools.count(),
                                gen_segments(before_intro_split, sample_rate, segment_duration, segment_stride_duration)):
            librosa.output.write_wav(f'{dataset_dir_path}\\{sample_name}\\negative\\a_{i}.wav', segment, sample_rate)
        for (i, segment) in zip(itertools.count(),
                                gen_segments(intro_split, sample_rate, segment_duration, segment_stride_duration)):
            librosa.output.write_wav(f'{dataset_dir_path}\\{sample_name}\\positive\\{i}.wav', segment, sample_rate)
        for (i, segment) in zip(itertools.count(),
                                gen_segments(after_intro_split, sample_rate, segment_duration, segment_stride_duration)):
            librosa.output.write_wav(f'{dataset_dir_path}\\{sample_name}\\negative\\b_{i}.wav', segment, sample_rate)


def extract_features(signal, sample_rate, used_features=USED_FEATURES):
    '''
    从波形切段中提取特征
    '''
    features = []
    features_names = []

    stft = librosa.stft(signal, n_fft=256)
    spectrogram_magnitude = np.abs(stft)
    melspectrogram = librosa.feature.melspectrogram(S=spectrogram_magnitude ** 2, sr=sample_rate)

    if 'spectro' in used_features:
        spectro = np.mean(spectrogram_magnitude.T, axis=0)
        features.append(spectro)
        features_names.extend(['spectro'] * len(spectro))

    if 'melspectro' in used_features:
        melspectro = np.mean(melspectrogram.T, axis=0)
        features.append(melspectro)
        features_names.extend(['melspectro'] * len(melspectro))

    if 'contrast' in used_features:
        contrast = np.mean(librosa.feature.spectral_contrast(S=spectrogram_magnitude, sr=sample_rate).T, axis=0)
        features.append(contrast)
        features_names.extend(['contrast'] * len(contrast))

    if 'mfcc' in used_features:
        mfcc = np.mean(librosa.feature.mfcc(S=librosa.power_to_db(melspectrogram), sr=sample_rate, n_mfcc=40).T, axis=0)
        features.append(mfcc)
        features_names.extend(['mfcc'] * len(mfcc))

    features = np.concatenate(features)
    return features, features_names


def gen_model_input(dataset_dir_path=DATASET_DIR_PATH):
    '''
    从波形切段中提取特征和元信息
    '''
    model_input = []

    for sample_name in os.listdir(dataset_dir_path):
        log(f'entering {dataset_dir_path}\\{sample_name}')
        log_push()

        sample_input = {'X': [], 'y': [], 'trace': [], 'sample_name': None, 'sample_rate': None, 'features_names': None}
        for (class_label, class_name) in zip(itertools.count(), CLASS_NAMES):
            for wav_filename in os.listdir(f'{dataset_dir_path}\\{sample_name}\\{class_name}'):
                log(f'generating features of {wav_filename} ({class_name})')
                (sample_rate, signal) = wf.read(f'{dataset_dir_path}\\{sample_name}\\{class_name}\\{wav_filename}')
                features, features_names = extract_features(signal, sample_rate)
                sample_input['X'].append(features)
                sample_input['y'].append(class_label)
                sample_input['trace'].append((class_name, wav_filename))
        sample_input['sample_name'] = sample_name
        sample_input['sample_rate'] = sample_rate
        sample_input['features_names'] = features_names

        model_input.append(sample_input)
        log_pop()
        log(f'exiting {dataset_dir_path}\\{sample_name}: X.shape = ({len(sample_input["X"])},{sample_input["X"][0].shape})')

    return model_input


def load_model_input(model_input_path=MODEL_INPUT_PATH):
    with open(model_input_path, 'rb') as f:
        return pickle.load(f)


def main(model_input_path=MODEL_INPUT_PATH):
    # 取消注释可以重新生成波形切片
    # gen_dataset()
    model_input = gen_model_input()
    with open(model_input_path, 'wb') as f:
        pickle.dump(model_input, f, True)
    log(f'====END of MAIN====')


if __name__ == '__main__':
    main()
