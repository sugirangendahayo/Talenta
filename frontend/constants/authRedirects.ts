/**
 * Where Supabase Auth should send users after they click a link in an email
 * (confirm signup, password reset, resend, etc.).
 *
 * Both constants below resolve to the SAME small standalone web page
 * (`web/auth-action.html`) once it's deployed, instead of the `talenta://`
 * deep link scheme directly — email links are often opened on a desktop/PC
 * where a custom URI scheme can't do anything. That page shows a clean
 * "success" confirmation and — only when opened on a phone — automatically
 * hands off into the app (falling back to app store links if it isn't
 * installed). It reads Supabase's own `type` param (`signup`, `recovery`,
 * etc.) to decide which in-app screen to hand off to, so one URL covers
 * every email-based auth flow.
 *
 * IMPORTANT: set EXPO_PUBLIC_AUTH_ACTION_URL once `web/auth-action.html` is
 * deployed (e.g. to Vercel/Netlify/GitHub Pages — no custom domain required,
 * a free `*.vercel.app` style URL works fine here). Until then, each
 * constant falls back to its original direct deep link so auth flows keep
 * working exactly as before during development.
 */
const DEPLOYED_ACTION_URL = process.env.EXPO_PUBLIC_AUTH_ACTION_URL;

export const AUTH_ACTION_URL = DEPLOYED_ACTION_URL || "talenta://auth/signin";
export const AUTH_ACTION_RESET_URL = DEPLOYED_ACTION_URL || "talenta://auth/reset-password";
