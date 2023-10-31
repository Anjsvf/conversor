import React, { useState } from 'react';
import './style.css';

function Converter() {
  const [videoFile, setVideoFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');

  const convertVideoToAudio = async () => {
    if (!videoFile) {
      alert('Por favor, selecione um vídeo.');
      return;
    }

    try {
      const blob = await convertVideoToAudioBlob(videoFile);
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Erro ao converter o vídeo em áudio:', error);
      alert('Erro ao converter o vídeo em áudio.');
    }
  };

  const convertVideoToAudioBlob = async (videoFile) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoFile);

      video.onloadedmetadata = async () => {
        const audioContext = new AudioContext();
        const mediaStreamDestination =
          audioContext.createMediaStreamDestination();
        const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          resolve(audioBlob);
        };

        const audioSource = audioContext.createMediaElementSource(video);
        audioSource.connect(mediaStreamDestination);

        mediaRecorder.start();
        video.play();

        setTimeout(() => {
          mediaRecorder.stop();
          audioContext.close();
        }, video.duration * 1000);
      };

      video.onerror = (error) => {
        reject(error);
      };

      video.load();
    });
  };

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  return (
    <div className="App">
      <h1>Conversor de Vídeo para Áudio</h1>
      <label htmlFor="videoFile" className="file-label">
        Escolher Arquivo
      </label>
      <input
        type="file"
        id="videoFile"
        accept="video/*"
        onChange={handleFileChange}
      />
      <button onClick={convertVideoToAudio} id="convertButton">
        Converter
      </button>
      <audio controls id="audioPlayer" src={audioUrl}></audio>
      {audioUrl && (
        <a href={audioUrl} download="audio.wav">
          Download Áudio
        </a>
      )}
    </div>
  );
}

export default Converter;
