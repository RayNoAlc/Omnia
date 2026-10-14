// WebAuthn Biometrics & Privacy Security Module for Omnia
// Supports native biometric verification (Windows Hello, Touch ID, Face ID, Android Fingerprint)
// with safe fallback to security PIN.

export async function isBiometricsAvailable() {
  try {
    if (
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
    ) {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return false;
  } catch (e) {
    return false;
  }
}

export async function registerBiometrics(username = "estudante") {
  if (!window.PublicKeyCredential) {
    throw new Error("Biometria não suportada neste navegador.");
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);
  const userIdBytes = new TextEncoder().encode(username.slice(0, 16));

  const hostname = window.location.hostname || "localhost";

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: {
        name: "Omnia - Vida Universitária",
        id: hostname === "localhost" ? undefined : hostname,
      },
      user: {
        id: userIdBytes,
        name: username,
        displayName: `Estudante Omnia (${username})`,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },   // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
    },
  });

  if (credential) {
    localStorage.setItem("omnia_biometrics_registered", "true");
    localStorage.setItem("omnia_biometrics_id", credential.id);
    return true;
  }
  return false;
}

export async function authenticateBiometrics() {
  if (!window.PublicKeyCredential) {
    throw new Error("Biometria não disponível.");
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);
  const hostname = window.location.hostname || "localhost";

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      timeout: 60000,
      userVerification: "required",
      rpId: hostname === "localhost" ? undefined : hostname,
    },
  });

  return Boolean(assertion);
}

export function setSecurityPin(pin) {
  if (pin && pin.length >= 4) {
    localStorage.setItem("omnia_security_pin", pin);
    return true;
  }
  return false;
}

export function verifySecurityPin(inputPin) {
  const stored = localStorage.getItem("omnia_security_pin");
  if (!stored) return true; // Sem PIN configurado
  return stored === inputPin;
}

export function isPrivacyLockEnabled() {
  try {
    const cfg = JSON.parse(localStorage.getItem("omnia_config") || "{}");
    return Boolean(cfg.enableBiometricLock);
  } catch {
    return false;
  }
}
