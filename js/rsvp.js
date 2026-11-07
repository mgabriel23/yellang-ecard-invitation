/* =========================================================
   Szhawn Marq Invitation — RSVP submission
   Self-contained. Wire to Web3Forms (recommended) or Formspree.
   Fires `rsvp:submitted` on success — main.js listens to hide
   the floating pill and launch confetti.
   ========================================================= */

(function () {
	'use strict';

	// ============================================================
	// CONFIG — edit these values only
	// ============================================================
	const CONFIG = {
		// 'web3forms' (recommended) or 'formspree'
		provider: 'web3forms',

		// Get a free key at https://web3forms.com — paste it here.
		web3formsKey: '18010f33-9d14-4c46-a2ff-b87b4440e91c',

		// Only used if provider === 'formspree'
		formspreeId: 'PASTE_YOUR_FORMSPREE_ID',

		// Subject of the notification email
		subject: "RSVP — Szhawn Marq's 1st Birthday and christening",

		// Shown in the mailto: fallback if the POST fails
		fallbackEmail: 'markbryan.gabriel@gmail.com',
	};
	// ============================================================

	const form = document.getElementById('rsvpForm');
	if (!form) return;

	const successBox = document.getElementById('rsvpSuccess');
	const errorBox = document.getElementById('rsvpError');
	const errorText = document.getElementById('rsvpErrorMessage');
	const submitBtn = document.getElementById('submitRsvpBtn');
	const guestCount = document.getElementById('guestCount');
	const declineRadio = form.querySelector('input[name="entry.1000002"][value="Reject"]');
	const honeypot = form.querySelector('input[name="website"]');

	const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

	// ---------- Disable guest count when declining ----------
	form.querySelectorAll('input[name="entry.1000002"]').forEach(radio => {
		radio.addEventListener('change', () => {
			if (guestCount) guestCount.disabled = !!(declineRadio && declineRadio.checked);
		});
	});

	// ---------- Helpers ----------
	function getEndpoint() {
		return CONFIG.provider === 'formspree'
			? `https://formspree.io/f/${CONFIG.formspreeId}`
			: 'https://api.web3forms.com/submit';
	}

	function isConfigPlaceholder() {
		if (CONFIG.provider === 'web3forms') return CONFIG.web3formsKey.startsWith('PASTE_');
		return CONFIG.formspreeId.startsWith('PASTE_');
	}

	function buildMailtoBody(formData) {
		const skip = new Set(['access_key', 'subject', 'from_name', 'botcheck', 'website']);
		const lines = [];
		formData.forEach((value, key) => {
			if (skip.has(key) || String(value).trim() === '') return;
			lines.push(`${key}: ${value}`);
		});
		return lines.join('\n');
	}

	function showError(message, mailtoBody) {
		if (!errorBox) return;
		if (errorText) errorText.textContent = message;

		const fallback = document.getElementById('rsvpMailtoFallback');
		if (fallback && mailtoBody) {
			const s = encodeURIComponent(CONFIG.subject);
			const b = encodeURIComponent(mailtoBody);
			fallback.href = `mailto:${CONFIG.fallbackEmail}?subject=${s}&body=${b}`;
			fallback.classList.remove('hidden');
		}
		errorBox.classList.remove('hidden');
		if (submitBtn) {
			submitBtn.disabled = false;
			submitBtn.innerHTML = originalBtnHTML;
		}
	}

	function clearError() {
		if (errorBox) errorBox.classList.add('hidden');
	}

	// ---------- Submit ----------
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		clearError();

		// Honeypot — bot filled the invisible field. Fake success, don't tell it.
		if (honeypot && honeypot.value.trim() !== '') {
			form.classList.add('hidden');
			if (successBox) successBox.classList.remove('hidden');
			document.dispatchEvent(new CustomEvent('rsvp:submitted'));
			return;
		}

		// Fail fast if the config wasn't set up
		if (isConfigPlaceholder()) {
			showError(
				'RSVP is not configured yet. Please contact the organizer directly.',
				''
			);
			return;
		}

		if (!submitBtn) return;
		submitBtn.disabled = true;
		submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting...';

		const formData = new FormData(form);

		if (CONFIG.provider === 'web3forms') {
			formData.append('access_key', CONFIG.web3formsKey);
			formData.append('subject', CONFIG.subject);
			formData.append('from_name', 'Szhawn Marq Invitation');
			formData.append('botcheck', '');
		}

		const mailtoBody = buildMailtoBody(formData);

		try {
			const response = await fetch(getEndpoint(), {
				method: 'POST',
				body: formData,
				headers: { 'Accept': 'application/json' }
			});

			let payload = null;
			try { payload = await response.json(); } catch (_) { /* non-JSON response */ }

			// Web3Forms always returns 200 — check payload.success.
			// Formspree returns 4xx on failure; no `success` field on success.
			const ok = response.ok && (!payload || payload.success !== false);
			if (!ok) {
				throw new Error((payload && payload.message) || 'Submission failed. Please try again.');
			}

			form.classList.add('hidden');
			if (successBox) successBox.classList.remove('hidden');
			document.dispatchEvent(new CustomEvent('rsvp:submitted'));

		} catch (err) {
			const isNetwork = err instanceof TypeError || /fetch|network|load failed/i.test(err.message || '');
			const message = isNetwork
				? 'We could not reach the server. Check your connection and try again.'
				: (err.message || 'Submission failed. Please try again.');
			showError(message, mailtoBody);
		}
	});

	// ---------- Retry button ----------
	const retryBtn = document.getElementById('rsvpRetryBtn');
	if (retryBtn) {
		retryBtn.addEventListener('click', () => {
			clearError();
			form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
		});
	}

})();