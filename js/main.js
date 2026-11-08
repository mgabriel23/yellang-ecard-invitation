/* =========================================================
   Alona Briella Invitation — behaviour
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
	/* ---------- Config ---------- */
	const EVENT_DATE_ISO = '2026-11-27T16:00:00+08:00'; // PHT (GMT+8)
	const EVENT_TITLE = "Alona Briella's 6th Birthday";
	const EVENT_DESC = "Join us in celebrating Alona Briella Japlos's 6th Birthday!";
	const EVENT_LOCATION = 'Japlos Residence, Fortune Village, Valenzuela City';
	const EVENT_START = '20261127T160000';
	const EVENT_END = '20261127T200000';

	/* ---------- Refs ---------- */
	// New Landing & Video Refs
	const landingPage = document.getElementById('landingPage');
	const openBtn = document.getElementById('openBtn');
	const introVideoContainer = document.getElementById('introVideoContainer');
	const introVideo = document.getElementById('introVideo');

	// Main Content & Audio Refs
	const mainContent = document.getElementById('mainContent');
	const bgAudio = document.getElementById('bgAudio');
	const audioControl = document.getElementById('audioControl');
	const toggleAudioBtn = document.getElementById('toggleAudioBtn');
	const audioIcon = document.getElementById('audioIcon');

	// Hero & UI Refs
	const heroPhoto = document.getElementById('heroPhoto');
	const countdownSr = document.getElementById('countdownSr');
	const countdownCards = document.getElementById('countdownCards');
	const countdownLive = document.getElementById('countdownLive');
	const countdownLabel = document.getElementById('countdownLabel');
	const rsvpPill = document.getElementById('rsvpPill');
	const heroSection = document.querySelector('main > section');
	const rsvpSection = document.getElementById('rsvp');

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	/* ---------- Audio Volume Control ---------- */
	const TARGET_VOLUME = 1; // 45% volume
	let fadeInterval;
	let isPlaying = false;
	let rsvpSubmitted = false;

	// Force the browser to always start at the top on refresh
	if ('scrollRestoration' in history) {
		history.scrollRestoration = 'manual';
	}

	/* ---------- Scroll lock while landing/video is open ---------- */
	document.body.style.overflow = 'hidden';

	/* ---------- Helpers ---------- */
	function launchConfetti() {
		if (prefersReducedMotion.matches) return;
		if (typeof window.confetti !== 'function') return;
		window.confetti({
			particleCount: 100,
			spread: 80,
			origin: { y: 0.6 },
			colors: ['#FF66C4', '#FFD166', '#00E5FF', '#A0E7E5', '#D41480', '#FFFFFF']
		});
	}

	function updateAudioUI() {
		if (isPlaying) {
			audioIcon.className = 'fas fa-music';
			toggleAudioBtn.classList.add('is-playing');
			toggleAudioBtn.setAttribute('aria-label', 'Pause background music');
			toggleAudioBtn.setAttribute('aria-pressed', 'true');
		} else {
			audioIcon.className = 'fas fa-volume-mute';
			toggleAudioBtn.classList.remove('is-playing');
			toggleAudioBtn.setAttribute('aria-label', 'Play background music');
			toggleAudioBtn.setAttribute('aria-pressed', 'false');
		}
	}

	function fadeAudio(audioElement, targetVol, duration) {
		clearInterval(fadeInterval);
		const startVol = audioElement.volume;
		const steps = 30;
		const stepTime = duration / steps;
		const volStep = (targetVol - startVol) / steps;
		let currentStep = 0;

		fadeInterval = setInterval(() => {
			currentStep++;
			let newVol = startVol + (volStep * currentStep);
			if (newVol < 0) newVol = 0;
			if (newVol > 1) newVol = 1;
			audioElement.volume = newVol;

			if (currentStep >= steps) {
				clearInterval(fadeInterval);
				if (targetVol === 0) {
					audioElement.pause();
				}
			}
		}, stepTime);
	}

	function showToast(message) {
		const toast = document.createElement('div');
		toast.textContent = message;
		toast.setAttribute('role', 'status');
		toast.className = 'toast';
		document.body.appendChild(toast);
		setTimeout(() => { toast.style.opacity = '0'; }, 2000);
		setTimeout(() => { toast.remove(); }, 2400);
	}

	/* ---------- Landing / Video transition ---------- */
	let isOpening = false;
	let introFinished = false;

	function playIntroVideo() {
		if (isOpening) return;
		isOpening = true;

		// 1. Fade out the landing page
		landingPage.classList.add('fade-out');

		// 2. Show the video container
		setTimeout(() => {
			landingPage.style.display = 'none';
			introVideoContainer.classList.remove('hidden');

			// Play the blurred background video
			const introVideoBg = document.getElementById('introVideoBg');
			if (introVideoBg) {
				introVideoBg.play().catch(e => console.log("Bg video error:", e));
			}

			// Play the main video
			introVideo.play().catch((e) => {
				console.log("Autoplay prevented.");
				finishIntro();
			});
		}, 400);

		// 3. Listen for the video ending naturally (as a fallback)
		introVideo.addEventListener('ended', finishIntro);

		// 4. Trigger the fade 3 seconds BEFORE the video ends
		introVideo.addEventListener('timeupdate', () => {
			if (introVideo.duration > 2) {
				const timeLeft = introVideo.duration - introVideo.currentTime;
				if (timeLeft <= 2) { // <--- Changed from 3 to 1.5
					finishIntro();
				}
			}
		});
	}

	function finishIntro() {
		// Prevent double-firing (since both timeupdate and 'ended' might trigger)
		if (introFinished) return;
		introFinished = true;

		// Start fading the video out smoothly
		introVideoContainer.classList.add('fade-out');

		// Start the background music
		bgAudio.volume = 0;
		bgAudio.play().then(() => {
			isPlaying = true;
			audioControl.classList.remove('hidden');
			updateAudioUI();
			fadeAudio(bgAudio, TARGET_VOLUME, 1500);
		}).catch(() => {
			audioControl.classList.remove('hidden');
			updateAudioUI();
		});

		// Fire the MEGA CONFETTI right as the video starts fading
		launchMegaConfetti();

		// Wait 1.5 seconds for the video to mostly fade out, then reveal the main page
		setTimeout(() => {
			introVideoContainer.style.display = 'none';
			if (introVideoBg) introVideoBg.pause();
			introVideo.pause();

			window.scrollTo(0, 0);

			mainContent.classList.add('is-visible');
			mainContent.inert = false;
			document.body.style.overflow = '';

			setTimeout(() => {
				startScrollReveal();
				startRsvpPillTracking();
			}, 100);

		}, 1500); // 1.5s delay lets the video fade out smoothly underneath
	}

	/* ---------- Mega Confetti ---------- */
	function launchMegaConfetti() {
		if (prefersReducedMotion.matches) return;
		if (typeof window.confetti !== 'function') return;

		const colors = ['#FF66C4', '#FFD166', '#00E5FF', '#A0E7E5', '#D41480', '#FFFFFF'];

		// 1. Initial center blast
		window.confetti({
			particleCount: 200,
			spread: 100,
			origin: { y: 0.6 },
			colors: colors,
			startVelocity: 45
		});

		// 2. Continuous side cannons for 3 seconds
		const duration = 3000;
		const end = Date.now() + duration;

		(function frame() {
			window.confetti({
				particleCount: 4,
				angle: 60,
				spread: 55,
				origin: { x: 0, y: 0.7 },
				colors: colors
			});
			window.confetti({
				particleCount: 4,
				angle: 120,
				spread: 55,
				origin: { x: 1, y: 0.7 },
				colors: colors
			});

			if (Date.now() < end) {
				requestAnimationFrame(frame);
			}
		}());
	}

	// Attach event listeners for Landing / Video
	openBtn.addEventListener('click', playIntroVideo);

	introVideoContainer.addEventListener('click', finishIntro);

	// Optional: If you use a GIF instead of a video, uncomment this:
	// setTimeout(finishIntro, 8000);

	/* ---------- Audio toggle ---------- */
	toggleAudioBtn.addEventListener('click', () => {
		if (isPlaying) {
			isPlaying = false;
			updateAudioUI();
			fadeAudio(bgAudio, 0, 500);
		} else {
			isPlaying = true;
			updateAudioUI();
			bgAudio.play().then(() => {
				fadeAudio(bgAudio, TARGET_VOLUME, 1000);
			}).catch(() => { });
		}
	});

	/* ---------- Add to calendar (.ics) ---------- */
	function escapeICS(text) {
		return text
			.replace(/\\/g, '\\\\')
			.replace(/[,;]/g, '\\$&')
			.replace(/\n/g, '\\n');
	}

	function buildICS() {
		const now = new Date();
		const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
		const uid = `alona-6th-bday-${now.getTime()}@alona-invitation`;

		return [
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//Alona Briella Invitation//EN',
			'CALSCALE:GREGORIAN',
			'METHOD:PUBLISH',
			'BEGIN:VEVENT',
			`UID:${uid}`,
			`DTSTAMP:${dtstamp}`,
			`DTSTART;TZID=Asia/Manila:${EVENT_START}`,
			`DTEND;TZID=Asia/Manila:${EVENT_END}`,
			`SUMMARY:${escapeICS(EVENT_TITLE)}`,
			`DESCRIPTION:${escapeICS(EVENT_DESC)}`,
			`LOCATION:${escapeICS(EVENT_LOCATION)}`,
			'STATUS:CONFIRMED',
			'END:VEVENT',
			'END:VCALENDAR'
		].join('\r\n') + '\r\n';
	}

	document.getElementById('addToCalendarBtn').addEventListener('click', () => {
		const blob = new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = 'Alona_Briella_6th_Birthday.ics';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		setTimeout(() => URL.revokeObjectURL(link.href), 1000);
		showToast('Calendar file downloaded');
	});

	/* ---------- Countdown + zero-state ---------- */
	const targetTime = new Date(EVENT_DATE_ISO).getTime();
	const els = {
		days: document.getElementById('days'),
		hours: document.getElementById('hours'),
		minutes: document.getElementById('minutes'),
		seconds: document.getElementById('seconds')
	};

	const pad = n => (n < 10 ? '0' + n : String(n));

	function enterZeroState() {
		if (!countdownCards || !countdownLive) return;
		countdownCards.classList.add('hidden');
		countdownLive.classList.remove('hidden');
		if (countdownLabel) countdownLabel.classList.add('hidden');
	}

	function updateCountdown() {
		const diff = targetTime - Date.now();
		if (diff <= 0) {
			Object.values(els).forEach(el => { el.textContent = '00'; });
			enterZeroState();
			return;
		}
		els.days.textContent = pad(Math.floor(diff / 86400000));
		els.hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
		els.minutes.textContent = pad(Math.floor((diff % 3600000) / 60000));
		els.seconds.textContent = pad(Math.floor((diff % 60000) / 1000));
	}

	function announceCountdown() {
		if (!countdownSr) return;
		const diff = targetTime - Date.now();
		if (diff <= 0) {
			countdownSr.textContent = "The celebration day has arrived!";
			return;
		}
		const days = Math.floor(diff / 86400000);
		countdownSr.textContent = days <= 1
			? "Less than a day until Alona Briella's celebration on November 27, 2026."
			: `${days} days until Alona Briella's celebration on November 27, 2026.`;
	}

	updateCountdown();
	announceCountdown();
	setInterval(updateCountdown, 1000);

	/* ---------- Scroll reveal ---------- */
	const revealEls = document.querySelectorAll('.reveal');
	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('active');
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.15 });

	function startScrollReveal() {
		revealEls.forEach(el => observer.observe(el));
	}

	/* ---------- Floating RSVP pill ---------- */
	let pillHeroSeen = false;
	let pillRsvpInView = false;

	function refreshRsvpPill() {
		if (!rsvpPill) return;
		const show = !rsvpSubmitted && pillHeroSeen && !pillRsvpInView;
		rsvpPill.classList.toggle('is-visible', show);
	}

	function startRsvpPillTracking() {
		if (!rsvpPill || !heroSection || !rsvpSection) return;

		const heroObserver = new IntersectionObserver((entries) => {
			entries.forEach(e => {
				pillHeroSeen = !e.isIntersecting;
				refreshRsvpPill();
			});
		}, { threshold: 0.15 });
		heroObserver.observe(heroSection);

		const rsvpObserver = new IntersectionObserver((entries) => {
			entries.forEach(e => {
				pillRsvpInView = e.isIntersecting;
				refreshRsvpPill();
			});
		}, { threshold: 0.25 });
		rsvpObserver.observe(rsvpSection);

		rsvpPill.addEventListener('click', () => {
			rsvpSection.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
		});
	}

	/* ---------- RSVP side-effects (logic lives in js/rsvp.js) ---------- */
	document.addEventListener('rsvp:submitted', () => {
		rsvpSubmitted = true;
		refreshRsvpPill();
		launchConfetti();
	});

	/* ---------- Hero image fallback ---------- */
	if (heroPhoto) {
		heroPhoto.addEventListener('error', () => {
			heroPhoto.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23D8F8FA'/%3E%3Ctext x='200' y='210' font-family='sans-serif' font-size='26' fill='%23FF66C4' text-anchor='middle'%3EAlona Briella%3C/text%3E%3C/svg%3E";
		}, { once: true });
	}

	/* ---------- Native App: Keyboard & Input Handling ---------- */
	const formInputs = document.querySelectorAll('.rsvp__input, .rsvp__select, .rsvp__textarea');

	formInputs.forEach(input => {
		input.addEventListener('focus', (e) => {
			if (rsvpPill) rsvpPill.classList.remove('is-visible');
			setTimeout(() => {
				const yOffset = -120;
				const y = e.target.getBoundingClientRect().top + window.scrollY + yOffset;
				window.scrollTo({ top: y, behavior: 'smooth' });
			}, 300);
		});

		input.addEventListener('blur', () => {
			refreshRsvpPill();
		});
	});

	/* ---------- Custom Select Dropdown Logic ---------- */
	const guestDropdown = document.getElementById('guestDropdown');
	const guestTrigger = guestDropdown?.querySelector('.custom-select__trigger');
	const guestOptions = guestDropdown?.querySelectorAll('.custom-select__option');
	const guestSelectValue = document.getElementById('guestSelectValue');
	const nativeGuestSelect = document.getElementById('guestCount');

	if (guestDropdown && guestTrigger && nativeGuestSelect) {
		guestTrigger.addEventListener('click', () => {
			if (!guestDropdown.classList.contains('is-disabled')) {
				guestDropdown.classList.toggle('open');
			}
		});

		guestOptions.forEach(option => {
			option.addEventListener('click', () => {
				guestOptions.forEach(opt => opt.classList.remove('is-selected'));
				option.classList.add('is-selected');
				const value = option.getAttribute('data-value');
				guestSelectValue.textContent = value;
				nativeGuestSelect.value = value;
				nativeGuestSelect.dispatchEvent(new Event('change'));
				guestDropdown.classList.remove('open');
			});
		});

		document.addEventListener('click', (e) => {
			if (!guestDropdown.contains(e.target)) {
				guestDropdown.classList.remove('open');
			}
		});

		const observer = new MutationObserver(() => {
			if (nativeGuestSelect.disabled) {
				guestDropdown.classList.add('is-disabled');
			} else {
				guestDropdown.classList.remove('is-disabled');
			}
		});
		observer.observe(nativeGuestSelect, { attributes: true, attributeFilter: ['disabled'] });
	}
});