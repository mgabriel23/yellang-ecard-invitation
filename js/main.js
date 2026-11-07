/* =========================================================
   Szhawn Marq Invitation — behaviour
   No backend. Everything runs client-side.
   RSVP submission is currently a local stub — see Batch 4.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

	/* ---------- Config ---------- */
	const EVENT_DATE_ISO = '2026-12-13T10:00:00+08:00'; // PHT (GMT+8)
	const EVENT_TITLE = "Szhawn Marq's 1st Birthday & Holy Baptism";
	const EVENT_DESC = "Join us in celebrating Szhawn Marq Resurrection's 1st Birthday & Holy Baptism!";
	const EVENT_LOCATION = 'Holy Cross Parish & Reception Hall, Valenzuela City, Metro Manila';
	const EVENT_START = '20261213T100000';  // local time in Asia/Manila
	const EVENT_END = '20261213T150000';

	/* ---------- Refs ---------- */
	const envelopeGate = document.getElementById('envelopeGate');
	const envelope = document.getElementById('envelope');
	const openBtn = document.getElementById('openBtn');
	const mainContent = document.getElementById('mainContent');
	const bgAudio = document.getElementById('bgAudio');
	const audioControl = document.getElementById('audioControl');
	const toggleAudioBtn = document.getElementById('toggleAudioBtn');
	const audioIcon = document.getElementById('audioIcon');
	const heroPhoto = document.getElementById('heroPhoto');

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	let isPlaying = false;

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
			audioIcon.className = 'fas fa-music text-lg text-babyblue-500';
			toggleAudioBtn.setAttribute('aria-label', 'Pause background music');
			toggleAudioBtn.setAttribute('aria-pressed', 'true');
		} else {
			audioIcon.className = 'fas fa-volume-mute text-lg text-slate-400';
			toggleAudioBtn.setAttribute('aria-label', 'Play background music');
			toggleAudioBtn.setAttribute('aria-pressed', 'false');
		}
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

	/* ---------- Gate / envelope ---------- */
	function openInvitation() {
		envelope.classList.add('open');

		bgAudio.play().then(() => {
			isPlaying = true;
			audioControl.classList.remove('hidden');
			updateAudioUI();
		}).catch(() => {
			// Autoplay was blocked — show the control so the guest can tap.
			audioControl.classList.remove('hidden');
			updateAudioUI();
		});

		setTimeout(launchConfetti, 350);

		setTimeout(() => {
			envelopeGate.classList.add('opacity-0');
			setTimeout(() => {
				envelopeGate.style.display = 'none';
				mainContent.classList.remove('opacity-0');
				mainContent.inert = false;
				document.body.style.overflow = '';
				startScrollReveal();
			}, 700);
		}, 1100);
	}

	openBtn.addEventListener('click', openInvitation);

	/* ---------- Audio toggle ---------- */
	toggleAudioBtn.addEventListener('click', () => {
		if (isPlaying) {
			bgAudio.pause();
			isPlaying = false;
		} else {
			bgAudio.play().then(() => { isPlaying = true; }).catch(() => { });
		}
		updateAudioUI();
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

		const lines = [
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
		];
		return lines.join('\r\n') + '\r\n';
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

	/* ---------- Countdown ---------- */
	const targetTime = new Date(EVENT_DATE_ISO).getTime();
	const els = {
		days: document.getElementById('days'),
		hours: document.getElementById('hours'),
		minutes: document.getElementById('minutes'),
		seconds: document.getElementById('seconds')
	};

	function pad(n) { return n < 10 ? '0' + n : String(n); }

	function updateCountdown() {
		const diff = targetTime - Date.now();
		if (diff <= 0) {
			Object.values(els).forEach(el => { el.textContent = '00'; });
			return;
		}
		els.days.textContent = pad(Math.floor(diff / 86400000));
		els.hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
		els.minutes.textContent = pad(Math.floor((diff % 3600000) / 60000));
		els.seconds.textContent = pad(Math.floor((diff % 60000) / 1000));
	}

	updateCountdown();
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

	/* ---------- RSVP (local stub — Batch 4 will wire to a form service) ---------- */
	const rsvpForm = document.getElementById('rsvpForm');
	const rsvpSuccess = document.getElementById('rsvpSuccess');
	const submitRsvpBtn = document.getElementById('submitRsvpBtn');
	const guestCount = document.getElementById('guestCount');
	const declineRadio = rsvpForm.querySelector('input[name="entry.1000002"][value="Reject"]');

	// Disable guest count when declining
	rsvpForm.querySelectorAll('input[name="entry.1000002"]').forEach(radio => {
		radio.addEventListener('change', () => {
			const declined = declineRadio.checked;
			guestCount.disabled = declined;
		});
	});

	rsvpForm.addEventListener('submit', (e) => {
		e.preventDefault();
		submitRsvpBtn.disabled = true;
		submitRsvpBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting...';

		// TODO (Batch 4): POST to Web3Forms / Formspree and branch on response.
		setTimeout(() => {
			rsvpForm.classList.add('hidden');
			rsvpSuccess.classList.remove('hidden');
			launchConfetti();
		}, 500);
	});

	/* ---------- Hero image fallback ---------- */
	if (heroPhoto) {
		heroPhoto.addEventListener('error', () => {
			heroPhoto.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23E0F2FE'/%3E%3Ctext x='200' y='210' font-family='sans-serif' font-size='26' fill='%230284C7' text-anchor='middle'%3ESzhawn Marq%3C/text%3E%3C/svg%3E";
		}, { once: true });
	}

});