/**
 * 浏览器AudioWorklet API每次送多少个Float32过来
 */
export const AUDIO_WORKLET_INPUT_LENGTH = 128;
/**
 * 浏览器AudioWorklet API的采样率
 */
export const AUDIO_WORKLET_SAMPLE_FREQUENCY = 44100;
/**
 * 解析器每次解析（每个解析帧）需要多少个Float32
 */
export const AUDIO_ANALYSOR_FRAME_LENGTH = 256;
/**
 * 解析器每次解析（每个解析帧）需要多少个字节用于缓冲Float32
 */
export const AUDIO_ANALYSOR_FRAME_BYTE_LENGTH = AUDIO_ANALYSOR_FRAME_LENGTH * Float32Array.BYTES_PER_ELEMENT;
/**
 * 解析器解析帧缓冲区有多少个Float32
 * 
 * 生产者：AudioWorklet => 解析帧缓冲区 => 消费者：解析器
 */
export const AUDIO_ANALYSOR_RING_BUFFER_LENGTH = 1024;
/**
 * 解析器解析帧缓冲区有多少个字节
 * 
 * 生产者：AudioWorklet => 解析帧缓冲区 => 消费者：解析器
 */
export const AUDIO_ANALYSOR_RING_BUFFER_BYTE_LENGTH = AUDIO_ANALYSOR_RING_BUFFER_LENGTH * AUDIO_ANALYSOR_FRAME_BYTE_LENGTH;
/**
 * 解析器每多少个解析帧输出一次平滑后的结果
 */
export const AUDIO_ANALYSOR_WINDOW_STRIDE = 400 // 每1.16秒
/**
 * 解析器将多少个解析帧的结果做平均
 */
export const AUDIO_ANALYSOR_WINDOW_WIDTH = 2000 // 5.8秒
/**
 * 解析器需要存多少个之前stride来计算当前window
 */
export const AUDIO_ANALYSOR_STRIDE_IN_WINDOW_COUNT = AUDIO_ANALYSOR_WINDOW_WIDTH / AUDIO_ANALYSOR_WINDOW_STRIDE;

export const FEATURE_FFT_COUNT = AUDIO_ANALYSOR_FRAME_LENGTH / 2;
export const FEATURE_MFCC_COUNT = 20;
export const FEATURE_COUNT = FEATURE_FFT_COUNT + FEATURE_MFCC_COUNT;
export const FEATURE_MFCC_LOW_FREQUENCY = 300;
export const FEATURE_MFCC_HIGH_FREQUENCY = 3500;
