// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Mendapatkan referensi ke elemen-elemen DOM
    const lyricsInput = document.getElementById('lyricsInput');
    const generateBtn = document.getElementById('generateBtn');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result'); // Untuk menampilkan pesan sukses atau hasil
    const audioPlayer = document.getElementById('audioPlayer');
    const downloadLink = document.getElementById('downloadLink');
    const errorDiv = document.getElementById('error'); // Untuk menampilkan pesan error secara umum
    const errorMessageElem = document.getElementById('errorMessage'); // Untuk detail pesan error

    // URL API ngrok Anda yang sedang aktif dan berfungsi.
    // PENTING: URL ini akan berubah setiap kali Anda memulai ulang ngrok di akun gratis.
    // Pastikan untuk selalu menambahkan "/generate-music" di akhir.
    const BACKEND_API_URL = 'https://4df59adb99ac.ngrok-free.app/generate-music';

    // === Fungsi Pembantu ===
    // Fungsi untuk menyembunyikan semua pesan status (loading, hasil, error)
    function hideAllMessages() {
        loadingDiv.classList.add('hidden');
        resultDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        downloadLink.classList.add('hidden'); // Sembunyikan link download juga
        // Bersihkan konten resultDiv dan errorMessageElem setiap kali disembunyikan
        resultDiv.innerHTML = '';
        errorMessageElem.textContent = '';
    }

    // === Validasi Elemen DOM ===
    // Memastikan semua elemen yang dibutuhkan ada sebelum menambahkan event listener
    if (!lyricsInput || !generateBtn || !loadingDiv || !resultDiv || !audioPlayer || !downloadLink || !errorDiv || !errorMessageElem) {
        console.error('Satu atau lebih elemen DOM tidak ditemukan. Pastikan semua ID HTML benar.');
        // Mungkin tampilkan pesan error di suatu tempat yang terlihat oleh pengguna
        // atau nonaktifkan tombol generate agar tidak ada interaksi yang gagal
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Error: Elemen tidak lengkap';
        }
        return; // Hentikan eksekusi jika elemen penting tidak ada
    }

    // === Event Listener untuk Tombol Generate ===
    generateBtn.addEventListener('click', async () => {
        const lyrics = lyricsInput.value.trim();

        if (lyrics.length === 0) {
            hideAllMessages(); // Sembunyikan pesan lain jika ada
            errorMessageElem.textContent = 'Silakan masukkan lirik atau teks terlebih dahulu!';
            errorDiv.classList.remove('hidden');
            return; // Hentikan eksekusi
        }

        // 1. Sembunyikan semua pesan sebelumnya dan tampilkan loading
        hideAllMessages();
        loadingDiv.classList.remove('hidden');
        generateBtn.disabled = true; // Nonaktifkan tombol saat memproses
        generateBtn.textContent = 'Membuat Musik...'; // Beri umpan balik pada tombol

        try {
            // 2. Kirim permintaan POST ke backend
            const response = await fetch(BACKEND_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Tambahkan header otorisasi jika backend Anda membutuhkannya, contoh:
                    // 'Authorization': 'Bearer your_token_here'
                },
                body: JSON.stringify({ text: lyrics }), // Mengirim lirik dalam format JSON
            });

            // 3. Periksa apakah respons tidak OK (misalnya status 4xx atau 5xx)
            if (!response.ok) {
                let errorDetails = 'Terjadi kesalahan saat membuat musik.';
                // Coba parse pesan error yang lebih detail dari backend jika ada
                try {
                    const errorData = await response.json();
                    // Gunakan pesan error dari backend jika tersedia, jika tidak, gunakan default
                    errorDetails = errorData.error || errorData.message || errorDetails;
                } catch (jsonError) {
                    // Jika respons bukan JSON, gunakan status HTTP dan teks status
                    errorDetails = `Error ${response.status}: ${response.statusText}`;
                }
                // Lempar error untuk ditangkap di blok catch
                throw new Error(errorDetails);
            }

            // 4. Jika respons OK, parse data JSON
            const data = await response.json();
            
            // 5. Periksa apakah respons API mengandung data audio yang diharapkan
            if (data.audio_data && data.audio_mime_type) {
                // Buat URL data dari string Base64 yang diterima
                const audioDataURL = `data:${data.audio_mime_type};base64,${data.audio_data}`;
                
                // Setel sumber audio dan muat ulang pemain audio
                audioPlayer.src = audioDataURL;
                audioPlayer.load(); // Memuat audio baru
                audioPlayer.play(); // Memutar otomatis audio
                
                // Konfigurasi link download
                downloadLink.href = audioDataURL;
                // Tetapkan nama file saat diunduh, default ke .wav
                downloadLink.download = `generated_instrumental.${data.audio_mime_type.split('/')[1] || 'wav'}`; 
                
                // Tampilkan pesan sukses dan kontrol audio
                resultDiv.innerHTML = 'Musik berhasil dibuat! Putar atau unduh di bawah.';
                resultDiv.classList.remove('hidden');
                downloadLink.classList.remove('hidden');

            } else {
                // Jika data audio tidak ada dalam respons, anggap ini sebagai error
                throw new Error('Respons API tidak mengandung data audio atau tipe MIME yang diharapkan.');
            }

        } catch (error) {
            // Tangani semua error yang terjadi selama proses fetch atau pemrosesan
            console.error('Error:', error); // Log error ke konsol browser
            errorMessageElem.textContent = error.message; // Tampilkan pesan error ke pengguna
            errorDiv.classList.remove('hidden'); // Tampilkan div error
        } finally {
            // 6. Sembunyikan loading dan aktifkan kembali tombol generate
            loadingDiv.classList.add('hidden');
            generateBtn.disabled = false; // Aktifkan kembali tombol
            generateBtn.textContent = 'Hasilkan Musik'; // Kembalikan teks tombol
        }
    });
});
