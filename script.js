// script.js

document.addEventListener('DOMContentLoaded', () => {
    const lyricsInput = document.getElementById('lyricsInput');
    const generateBtn = document.getElementById('generateBtn');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const audioPlayer = document.getElementById('audioPlayer');
    const downloadLink = document.getElementById('downloadLink');
    const errorDiv = document.getElementById('error');
    const errorMessageElem = document.getElementById('errorMessage');

    // GANTI DENGAN URL NGROK ANDA YANG SEDANG AKTIF DAN BERFUNGSI!
    // Ini akan berubah setiap kali Anda memulai ulang ngrok di akun gratis.
    // Pastikan untuk selalu menambahkan "/generate-music" di akhir.
    const BACKEND_API_URL = 'https://363b749ddeaf.ngrok-free.app/generate-music'; 

    generateBtn.addEventListener('click', async () => {
        const lyrics = lyricsInput.value.trim();

        if (lyrics.length === 0) {
            alert('Silakan masukkan lirik atau teks terlebih dahulu!');
            return;
        }

        // Sembunyikan semua pesan dan tampilkan loading
        hideAllMessages();
        loadingDiv.classList.remove('hidden');
        generateBtn.disabled = true; // Nonaktifkan tombol saat memproses

        try {
            const response = await fetch(BACKEND_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: lyrics }),
            });

            if (!response.ok) {
                // Coba parse pesan error dari backend
                let errorDetails = 'Terjadi kesalahan saat membuat musik.';
                try {
                    const errorData = await response.json();
                    errorDetails = errorData.error || errorDetails;
                } catch (jsonError) {
                    // Jika respons bukan JSON, gunakan status teks
                    errorDetails = `Error ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorDetails);
            }

            const data = await response.json();
            
            // Backend sekarang mengembalikan audio_data (Base64) dan audio_mime_type
            if (data.audio_data && data.audio_mime_type) {
                // Buat URL data dari Base64 string
                const audioDataURL = `data:${data.audio_mime_type};base64,${data.audio_data}`;
                
                audioPlayer.src = audioDataURL;
                audioPlayer.load(); // Memuat audio baru
                audioPlayer.play(); // Memutar otomatis
                
                // Untuk link download, kita menggunakan URL data
                downloadLink.href = audioDataURL;
                downloadLink.download = 'generated_instrumental.wav'; // Beri nama file saat diunduh
                downloadLink.classList.remove('hidden');
                resultDiv.classList.remove('hidden');
            } else {
                throw new Error('Respons API tidak mengandung data audio yang diharapkan.');
            }

        } catch (error) {
            console.error('Error:', error);
            errorMessageElem.textContent = error.message;
            errorDiv.classList.remove('hidden');
        } finally {
            loadingDiv.classList.add('hidden');
            generateBtn.disabled = false; // Aktifkan kembali tombol
        }
    });

    function hideAllMessages() {
        loadingDiv.classList.add('hidden');
        resultDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        // Sembunyikan juga link download saat menyembunyikan result div
        downloadLink.classList.add('hidden'); 
    }
});
