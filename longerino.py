import pyaudio
import wave
import keyboard
import threading

class AudioRecorder:
    def __init__(self, filename="output.wav"):
        self.filename = filename
        self.is_recording = False
        self.frames = []
        self.sample_format = pyaudio.paInt16
        self.channels = 2
        self.fs = 44100  # Sample rate

    def record(self):
        p = pyaudio.PyAudio()
        stream = p.open(format=self.sample_format,
                        channels=self.channels,
                        rate=self.fs,
                        frames_per_buffer=1024,
                        input=True)

        print("Recording... Press 'q' to stop.")

        self.is_recording = True

        while self.is_recording:
            data = stream.read(1024)
            self.frames.append(data)

        stream.stop_stream()
        stream.close()
        p.terminate()

        self.save_recording()

    def stop_recording(self):
        self.is_recording = False

    def save_recording(self):
        p = pyaudio.PyAudio()
        wf = wave.open(self.filename, 'wb')
        wf.setnchannels(self.channels)
        wf.setsampwidth(p.get_sample_size(self.sample_format))
        wf.setframerate(self.fs)
        wf.writeframes(b''.join(self.frames))
        wf.close()

        print(f"Recording saved as {self.filename}")

def main():
    recorder = AudioRecorder()
    
    # Start recording in a separate thread
    recording_thread = threading.Thread(target=recorder.record)
    recording_thread.start()

    # Wait for 'q' key press to stop recording
    keyboard.wait('q')
    recorder.stop_recording()

    # Wait for the recording thread to finish
    recording_thread.join()

if __name__ == "__main__":
    main()