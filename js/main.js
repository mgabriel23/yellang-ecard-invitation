/* =========================================================
   Szhawn Marq Invitation — behaviour
   RSVP submission remains a local stub until Batch 4.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
	/* ---------- Config ---------- */
	const EVENT_DATE_ISO = '2026-12-13T10:00:00+08:00'; // PHT (GMT+8)
	const EVENT_TITLE = "Szhawn Marq's 1st Birthday & Holy Baptism";
	const EVENT_DESC = "Join us in celebrating Szhawn Marq Resurrection's 1st Birthday & Holy Baptism!";
	const EVENT_LOCATION = 'Holy Cross Parish & Reception Hall, Valenzuela City, Metro Manila';
	const EVENT_START = '20261213T100000';
	const EVENT_END = '20261213T150000';

	/* ---------- Refs ---------- */
	const splashScreen = document.getElementById('splashScreen');
	const envelopeGate = document.getElementById('envelopeGate');
	const bearSeal = document.querySelector('.bear-seal');
	const envelope = document.getElementById('envelope');
	const openBtn = document.getElementById('openBtn');
	const mainContent = document.getElementById('mainContent');
	const bgAudio = document.getElementById('bgAudio');
	const audioControl = document.getElementById('audioControl');
	const toggleAudioBtn = document.getElementById('toggleAudioBtn');
	const audioIcon = document.getElementById('audioIcon');
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
	const TARGET_VOLUME = 0.45; // 45% volume (adjust between 0.3 and 0.6 as needed)
	let fadeInterval;

	let isPlaying = false;
	let rsvpSubmitted = false;

	// Force the browser to always start at the top on refresh
	if ('scrollRestoration' in history) {
		history.scrollRestoration = 'manual';
	}

	/* ---------- Scroll lock while gate is open ---------- */
	document.body.style.overflow = 'hidden';

	/* ---------- Helpers ---------- */
	function launchConfetti() {
		if (prefersReducedMotion.matches) return;
		if (typeof window.confetti !== 'function') return;
		window.confetti({
			particleCount: 80,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#BAE6FD', '#7DD3FC', '#FEF3C7', '#F59E0B', '#38BDF8']
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
		const steps = 30; // 30 frames for smoothness
		const stepTime = duration / steps;
		const volStep = (targetVol - startVol) / steps;
		let currentStep = 0;

		fadeInterval = setInterval(() => {
			currentStep++;
			let newVol = startVol + (volStep * currentStep);
			// Clamp between 0 and 1
			if (newVol < 0) newVol = 0;
			if (newVol > 1) newVol = 1;
			audioElement.volume = newVol;

			if (currentStep >= steps) {
				clearInterval(fadeInterval);
				if (targetVol === 0) {
					audioElement.pause(); // Pause only after fade out is done
				}
			}
		}, stepTime);
	}

	function showToast(message) {
		const toast = document.createElement('div');
		toast.textContent = message;
		toast.setAttribute('role', 'status');
		toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-full shadow-lg transition-opacity duration-300';
		document.body.appendChild(toast);
		setTimeout(() => { toast.style.opacity = '0'; }, 2000);
		setTimeout(() => { toast.remove(); }, 2400);
	}

	/* ---------- Premium Splash Screen ---------- */
	// Wait for fonts to be fully loaded before showing the splash screen
	document.fonts.ready.then(() => {
		if (splashScreen) {
			splashScreen.style.opacity = '1';

			setTimeout(() => {
				splashScreen.classList.add('fade-out');

				// Wait for splash fade-out, then reveal the gate
				setTimeout(() => {
					splashScreen.style.display = 'none';
					envelopeGate.classList.add('is-revealed'); // Fades the gate in
				}, 600);
			}, 2000); // 2 seconds
		}
	});

	/* ---------- Gate / envelope transition ---------- */
	function openInvitation() {
		// 1. Trigger the star spin animation
		if (bearSeal) {
			bearSeal.classList.add('is-spinning');
		}

		// 2. Start playing the audio with a smooth fade-in
		bgAudio.volume = 0; // Start silent
		bgAudio.play().then(() => {
			isPlaying = true;
			audioControl.classList.remove('hidden');
			updateAudioUI();
			fadeAudio(bgAudio, TARGET_VOLUME, 1500); // Fade to 45% over 1.5 seconds
		}).catch(() => {
			audioControl.classList.remove('hidden');
			updateAudioUI();
		});

		// 3. Fire confetti almost immediately (0.2s into the spin)
		setTimeout(() => {
			launchConfetti();
		}, 200);

		// 4. Trigger the cinematic scene transition right as the star finishes spinning (0.5s)
		setTimeout(() => {
			envelopeGate.classList.remove('is-revealed');
			envelopeGate.classList.add('is-hidden');

			// Force scroll to top BEFORE revealing the main content
			window.scrollTo(0, 0);

			mainContent.classList.add('is-visible');
			mainContent.inert = false;
			document.body.style.overflow = '';

			// 5. Clean up once the 0.6s CSS transition is complete
			setTimeout(() => {
				envelopeGate.style.display = 'none';
				startScrollReveal();
				startRsvpPillTracking();
			}, 650); // Slightly longer than the 0.6s CSS transition

		}, 500);
	}

	openBtn.addEventListener('click', openInvitation);

	/* ---------- Audio toggle ---------- */
	/* ---------- Audio toggle ---------- */
	toggleAudioBtn.addEventListener('click', () => {
		if (isPlaying) {
			isPlaying = false;
			updateAudioUI();
			fadeAudio(bgAudio, 0, 500); // Fade out over 0.5s, then pause automatically
		} else {
			isPlaying = true;
			updateAudioUI();
			bgAudio.play().then(() => {
				fadeAudio(bgAudio, TARGET_VOLUME, 1000); // Fade in over 1s
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
		const uid = `szhawn-1st-bday-${now.getTime()}@szhawn-invitation`;

		return [
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//Szhawn Marq Invitation//EN',
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
		link.download = 'Szhawn_Marq_1st_Birthday.ics';
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
			? "Less than a day until Szhawn Marq's celebration on December 13, 2026."
			: `${days} days until Szhawn Marq's celebration on December 13, 2026.`;
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
			heroPhoto.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23E0F2FE'/%3E%3Ctext x='200' y='210' font-family='sans-serif' font-size='26' fill='%230284C7' text-anchor='middle'%3ESzhawn Marq%3C/text%3E%3C/svg%3E";
		}, { once: true });
	}
	/* ---------- Native App: Keyboard & Input Handling ---------- */
	const formInputs = document.querySelectorAll('.rsvp__input, .rsvp__select, .rsvp__textarea');

	formInputs.forEach(input => {
		// When user taps an input, wait for keyboard to open, then scroll into view
		input.addEventListener('focus', (e) => {
			// Hide floating RSVP pill so it doesn't cover the keyboard
			if (rsvpPill) rsvpPill.classList.remove('is-visible');

			// Scroll the input into view (100px offset for breathing room)
			setTimeout(() => {
				const yOffset = -120;
				const y = e.target.getBoundingClientRect().top + window.scrollY + yOffset;
				window.scrollTo({ top: y, behavior: 'smooth' });
			}, 300); // 300ms wait for iOS/Android keyboard animation
		});

		// When user taps away (keyboard closes), restore the floating pill
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
		// Toggle open/close
		guestTrigger.addEventListener('click', () => {
			if (!guestDropdown.classList.contains('is-disabled')) {
				guestDropdown.classList.toggle('open');
			}
		});

		// Handle option selection
		guestOptions.forEach(option => {
			option.addEventListener('click', () => {
				// 1. Remove selected class from all
				guestOptions.forEach(opt => opt.classList.remove('is-selected'));

				// 2. Add to clicked
				option.classList.add('is-selected');

				// 3. Update visual text
				const value = option.getAttribute('data-value');
				guestSelectValue.textContent = value;

				// 4. Update hidden select (so rsvp.js catches it)
				nativeGuestSelect.value = value;
				nativeGuestSelect.dispatchEvent(new Event('change'));

				// 5. Close dropdown
				guestDropdown.classList.remove('open');
			});
		});

		// Close when clicking outside
		document.addEventListener('click', (e) => {
			if (!guestDropdown.contains(e.target)) {
				guestDropdown.classList.remove('open');
			}
		});

		// Sync disabled state from the hidden select to the visual trigger
		// (rsvp.js disables the select when user declines)
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