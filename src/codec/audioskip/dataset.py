import json
import os

import librosa
import numpy as np
import scipy.io.wavfile as wf
import sklearn.model_selection

# 波形切段的时长
SEGMENT_DURATION = 5
# (训练集)波形切段多久切一次
SEGMENT_TRAIN_STRIDE_DURATION = 3
# (测试集)波形切段多久切一次
SEGMENT_TEST_STRIDE_DURATION = 3
# 原始样本的目录
SAMPLE_DIR_PATH = 'G:\\userjs\\bilitwin\\samples'
# (训练集)波形切段保存路径
TRAIN_DIR_PATH = 'G:\\userjs\\bilitwin\\src\\codec\\audioskip\\train'
# (测试集)波形切段保存路径
TEST_DIR_PATH = 'G:\\userjs\\bilitwin\\src\\codec\\audioskip\\test'
# 类
CLASS_NAMES = ['negative', 'positive']

log = print  # lambda x: None


def max_multiple_leqt(a, m):
    '''
    返回小于等于`m`的`a`的最大倍数
    '''
    return m - m % a


def gen_segments(signal, sample_rate, segment_duration, segment_stride_duration):
    '''
    将波形切分为时长为`segment_duration`的小段，小段之间的重叠时长为`segment_stride_duration`
    '''
    segments = []
    segment_width = segment_duration * sample_rate
    segment_stride = segment_stride_duration * sample_rate

    for i in range(0, len(signal) + 1 - segment_width, segment_stride):
        segments.append(signal[i:i + segment_width])

    return segments


def gen_dataset():
    '''
    将波形切分为小段，保存到`TRAIN_DIR_PATH`或`TEST_DIR_PATH`
    '''
    for class_name in CLASS_NAMES:
        os.makedirs(f'{TRAIN_DIR_PATH}\\{class_name}', exist_ok=True)
        os.makedirs(f'{TEST_DIR_PATH}\\{class_name}', exist_ok=True)

    with open(f'{SAMPLE_DIR_PATH}\\inoutro.json') as f:
        inoutro = json.load(f)
    train, test = sklearn.model_selection.train_test_split(list(inoutro.items()), test_size=2)

    for (target_split, target_path, target_stride_duration) in (
        (train, TRAIN_DIR_PATH, SEGMENT_TRAIN_STRIDE_DURATION),
        (test, TEST_DIR_PATH, SEGMENT_TEST_STRIDE_DURATION)
    ):
        log(f'>> populating {target_path}')
        for (wav_filename, [intro_start_time, intro_end_time]) in target_split:
            log(f'>> spliting {wav_filename}, intro_start_time={intro_start_time}, intro_end_time={intro_end_time}')
            (signal, sample_rate) = librosa.load(f'{SAMPLE_DIR_PATH}\\{wav_filename}')

            before_intro_split, intro_split,  after_intro_split = np.split(signal, np.array((intro_start_time, intro_end_time)) * sample_rate)

            before_intro_segments = gen_segments(before_intro_split, sample_rate, SEGMENT_DURATION, target_stride_duration)
            intro_segments = gen_segments(intro_split, sample_rate, SEGMENT_DURATION, target_stride_duration)
            after_intro_segments = gen_segments(after_intro_split, sample_rate, SEGMENT_DURATION, target_stride_duration)

            for i in range(len(before_intro_segments)):
                librosa.output.write_wav(f'{target_path}\\negative\\{wav_filename.split(".wav")[0]}_a_{i}.wav', before_intro_segments[i], sample_rate)
            for i in range(len(intro_segments)):
                librosa.output.write_wav(f'{target_path}\\positive\\{wav_filename.split(".wav")[0]}_{i}.wav', intro_segments[i], sample_rate)
            for i in range(len(after_intro_segments)):
                librosa.output.write_wav(f'{target_path}\\negative\\{wav_filename.split(".wav")[0]}_b_{i}.wav', after_intro_segments[i], sample_rate)


def extract_features(signal, sample_rate):
    '''
    从波形切段中提取特征
    '''
    features_names = []

    stft = librosa.stft(signal)
    spectrogram_magnitude = np.abs(stft)
    melspectrogram = librosa.feature.melspectrogram(S=spectrogram_magnitude ** 2, sr=sample_rate)

    spectro = np.mean(spectrogram_magnitude.T, axis=0)
    features_names.extend(['spectro'] * len(spectro))

    melspectro = np.mean(melspectrogram.T, axis=0)
    features_names.extend(['melspectro'] * len(melspectro))

    contrast = np.mean(librosa.feature.spectral_contrast(S=spectrogram_magnitude, sr=sample_rate).T, axis=0)
    features_names.extend(['contrast'] * len(contrast))

    mfcc = np.mean(librosa.feature.mfcc(S=librosa.power_to_db(melspectrogram), sr=sample_rate, n_mfcc=40).T, axis=0)
    features_names.extend(['mfcc'] * len(mfcc))

    features = np.concatenate((spectro, melspectro, contrast, mfcc))
    return features, features_names


def gen_model_input():
    '''
    从波形切段中提取特征和元信息，保存到`.npy`/`.json`中
    '''
    X_train = []
    y_train = []
    trace_train = []
    X_test = []
    y_test = []
    trace_test = []
    sample_rate = 0
    features_names = None

    for (target_path, X, y, trace) in ((TRAIN_DIR_PATH, X_train, y_train, trace_train), (TEST_DIR_PATH, X_test, y_test, trace_test)):
        log(f'>> generating features for {target_path}')
        for class_name_index in range(len(CLASS_NAMES)):
            class_name = CLASS_NAMES[class_name_index]
            for wav_filename in os.listdir(f'{target_path}\\{class_name}'):
                log(f'>> generating features of {wav_filename}, {class_name}')
                (sample_rate, signal) = wf.read(f'{target_path}\\{class_name}\\{wav_filename}')
                features, features_names = extract_features(signal, sample_rate)
                X.append(features)
                y.append(class_name_index)
                trace.append((wav_filename, class_name))
    return X_train, y_train, trace_train, X_test, y_test, trace_test, sample_rate, features_names


def load_model_input():
    X_train = np.load('X_train.npy')
    y_train = np.load('y_train.npy')
    with open('trace_train.json') as f:
        trace_train = json.load(f)
    X_test = np.load('X_test.npy')
    y_test = np.load('y_test.npy')
    with open('trace_test.json') as f:
        trace_test = json.load(f)
    with open('sample_rate.json') as f:
        sample_rate = json.load(f)
    with open('features_names.json') as f:
        features_names = json.load(f)
    return X_train, y_train, trace_train, X_test, y_test, trace_test, sample_rate, features_names


def main():
    # gen_dataset()
    X_train, y_train, trace_train, X_test, y_test, trace_test, sample_rate, features_names = gen_model_input()
    np.save('X_train.npy', X_train)
    np.save('y_train.npy', y_train)
    with open('trace_train.json', 'w') as f:
        json.dump(trace_train, f)
    np.save('X_test.npy', X_test)
    np.save('y_test.npy', y_test)
    with open('trace_test.json', 'w') as f:
        json.dump(trace_test, f)
    with open('sample_rate.json', 'w') as f:
        json.dump(sample_rate, f)
    with open('features_names.json', 'w') as f:
        json.dump(features_names, f)
    log(f'====END of MAIN====')


if __name__ == '__main__':
    main()
