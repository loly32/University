document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('global-audio');
    const trackItems = document.querySelectorAll('.track-item');

    // Элементы нижней панели управления
    const bottomPlayer = document.getElementById('bottom-player');
    const playerPlayBtn = document.getElementById('player-play-btn');
    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');
    const playerProgress = document.getElementById('player-progress');
    const playerCurrentTime = document.getElementById('player-current-time');
    const playerTotalTime = document.getElementById('player-total-time');
    const playerVolume = document.getElementById('player-volume');

    // Форматирование времени
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Первоначальный подсчет времени для треков в списке
    trackItems.forEach(item => {
        const audioSrc = item.getAttribute('data-src');
        const timeSpan = item.querySelector('.track-time');

        if (audioSrc) {
            const tempAudio = new Audio(audioSrc);
            tempAudio.addEventListener('loadedmetadata', () => {
                timeSpan.textContent = formatTime(tempAudio.duration);
            });
        }
    });

    // Функция синхронизации иконки плей/пауза везде
    function updatePlayStatus(isPlaying) {
        if (isPlaying) {
            playerPlayBtn.textContent = '❚❚';
        } else {
            playerPlayBtn.textContent = '▶';
        }
    }

    // Клик по треку из списка
    trackItems.forEach(item => {
        item.addEventListener('click', () => {
            const audioSrc = item.getAttribute('data-src');
            const trackName = item.querySelector('.track-details h4').textContent;
            const trackArtist = item.querySelector('.track-details p').textContent;
            const stub = item.querySelector('.track-cover-stub');
            const currentAudioPath = audio.getAttribute('src');

            // Показываем нижнюю плашку плеера
            bottomPlayer.classList.add('active');

            // Заполняем инфо в нижней панели
            playerTitle.textContent = trackName;
            playerArtist.textContent = trackArtist;

            // Если трек уже играет — ставим на паузу
            if (currentAudioPath === audioSrc && !audio.paused) {
                audio.pause();
                stub.textContent = '▶';
                updatePlayStatus(false);
                return;
            }

            // Если стоял на паузе — продолжаем играть
            if (currentAudioPath === audioSrc && audio.paused) {
                audio.play().then(() => {
                    stub.textContent = '❚❚';
                    updatePlayStatus(true);
                });
                return;
            }

            // Переключение на новый трек
            trackItems.forEach(i => i.querySelector('.track-cover-stub').textContent = '▶');
            audio.setAttribute('src', audioSrc);
            audio.load();

            audio.play()
                .then(() => {
                    stub.textContent = '❚❚';
                    updatePlayStatus(true);
                })
                .catch(err => console.error("Ошибка запуска:", err));
        });
    });

    // Кнопка Плей/Пауза в САМОЙ нижней панели
    playerPlayBtn.addEventListener('click', () => {
        const currentAudioSrc = audio.getAttribute('src');
        if (!currentAudioSrc) return; // Если ничего не выбрано

        // Ищем активный трек в списке, чтобы синхронизировать иконку ▶/❚❚
        const activeTrack = Array.from(trackItems).find(i => i.getAttribute('data-src') === currentAudioSrc);
        const stub = activeTrack ? activeTrack.querySelector('.track-cover-stub') : null;

        if (!audio.paused) {
            audio.pause();
            updatePlayStatus(false);
            if (stub) stub.textContent = '▶';
        } else {
            audio.play().then(() => {
                updatePlayStatus(true);
                if (stub) stub.textContent = '❚❚';
            });
        }
    });

    // Обновление ползунка перемотки во время воспроизведения
    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.duration)) {
            // Рассчитываем процент прогресса
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            playerProgress.value = progressPercent;

            // Обновляем текущее время текстом
            playerCurrentTime.textContent = formatTime(audio.currentTime);
            playerTotalTime.textContent = formatTime(audio.duration);
        }
    });

    // Перемотка пользователем (когда двигает ползунок)
    playerProgress.addEventListener('input', () => {
        if (!isNaN(audio.duration)) {
            const newTime = (playerProgress.value / 100) * audio.duration;
            audio.currentTime = newTime;
        }
    });

    // Управление громкостью
    playerVolume.addEventListener('input', () => {
        audio.volume = playerVolume.value / 100;
    });

    // Конец трека
    audio.addEventListener('ended', () => {
        trackItems.forEach(i => i.querySelector('.track-cover-stub').textContent = '▶');
        updatePlayStatus(false);
        playerProgress.value = 0;
        playerCurrentTime.textContent = '0:00';
    });
});
