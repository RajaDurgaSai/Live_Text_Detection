import tensorflow as tf

# Check if TensorFlow is built with CUDA (GPU) support
print("Built with CUDA:", tf.test.is_built_with_cuda())

# List available physical devices (GPU)
gpus = tf.config.list_physical_devices('GPU')
print("Num GPUs Available: ", len(gpus))

if gpus:
    print("GPUs: ", gpus)
else:
    print("No GPU available.")
