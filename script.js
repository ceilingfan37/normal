const GOOGLE_FORM_RESPONSE_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfT4MgHBnYojkji8rKdcOWu-pBvnzXNpSE8ItPANwkXQ3t3jQ/formResponse";
const GOOGLE_FORM_EMAIL_ENTRY = "entry.2079756186";

function isValidEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setMenu(open){
  const panel = document.getElementById("mobilePanel");
  const btn = document.getElementById("menuBtn");
  if(!panel || !btn) return;

  if(open){
    panel.removeAttribute("hidden");
    btn.setAttribute("aria-expanded","true");
    btn.setAttribute("aria-label","Close menu");
    btn.classList.add("open");
  } else {
    panel.setAttribute("hidden","");
    btn.setAttribute("aria-expanded","false");
    btn.setAttribute("aria-label","Open menu");
    btn.classList.remove("open");
  }
}

function attachMobileMenu(){
  const btn = document.getElementById("menuBtn");
  const panel = document.getElementById("mobilePanel");
  if(!btn || !panel) return;

  btn.addEventListener("click", () => {
    const isHidden = panel.hasAttribute("hidden");
    setMenu(isHidden);
  });

  panel.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") setMenu(false);
  });
}

function attachBackTop(){
  const btn = document.getElementById("toTop");
  if(!btn) return;
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function attachFAQ(){
  const list = document.getElementById("faqList");
  if(!list) return;

  const items = Array.from(list.querySelectorAll(".faq-item"));

  function closeItem(item){
    const btn = item.querySelector(".faq-btn");
    const a = item.querySelector(".faq-a");
    const icon = item.querySelector(".faq-icon");
    if(!btn || !a) return;

    btn.setAttribute("aria-expanded", "false");
    a.setAttribute("hidden", "");
    if(icon) icon.textContent = "+";
  }

  function openItem(item){
    const btn = item.querySelector(".faq-btn");
    const a = item.querySelector(".faq-a");
    const icon = item.querySelector(".faq-icon");
    if(!btn || !a) return;

    btn.setAttribute("aria-expanded", "true");
    a.removeAttribute("hidden");
    if(icon) icon.textContent = "–";
  }

  items.forEach((item) => {
    const btn = item.querySelector(".faq-btn");
    const a = item.querySelector(".faq-a");
    if(!btn || !a) return;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // close others
      items.forEach((it) => {
        if(it !== item) closeItem(it);
      });

      // toggle current
      if(isOpen) closeItem(item);
      else openItem(item);
    });
  });
}

function attachWaitlist(formId){
  const form = document.getElementById(formId);
  if(!form) return;

  const emailEl = form.querySelector("input[type='email']");
  const submitBtn = form.querySelector("button[type='submit']");
  const fieldMsgEl = form.querySelector("[data-fieldmsg]");
  const statusEl = form.querySelector("[data-status]");

  const THANK_YOU = "Thanks — you’re on the list. Early access soon.";
  const INVALID = "Please enter a valid email.";
  const ERROR = "Something went wrong. Please try again.";

  function setStatus(msg, cls){
    if(!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.className = "status" + (cls ? ` ${cls}` : "");
  }

  function setFieldMsg(msg){
    if(!fieldMsgEl) return;
    fieldMsgEl.textContent = msg || "";
  }

  async function submitEmail(email){
    const fd = new FormData();
    fd.append(GOOGLE_FORM_EMAIL_ENTRY, email);

    // no-cors because Google Forms blocks standard CORS reads
    await fetch(GOOGLE_FORM_RESPONSE_URL, {
      method: "POST",
      mode: "no-cors",
      body: fd
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = (emailEl?.value || "").trim();
    setFieldMsg("");
    setStatus("", "soft");

    if(!email || !isValidEmail(email)){
      setFieldMsg(INVALID);
      setStatus(INVALID, "err");
      return;
    }

    if(submitBtn){
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.85";
    }

    try{
      await submitEmail(email);
      setStatus(THANK_YOU, "ok");
      setFieldMsg("");
      if(emailEl) emailEl.value = "";
    } catch(err){
      setStatus(ERROR, "err");
    } finally{
      if(submitBtn){
        submitBtn.disabled = false;
        submitBtn.style.opacity = "";
      }
    }
  });
}

function attachMobileWaitlistCTA(){
  const cta = document.getElementById("mobileWaitlistCTA");
  const waitlist = document.getElementById("waitlist");
  if(!cta || !waitlist) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      // hide CTA when waitlist is visible
      cta.style.display = entry.isIntersecting ? "none" : "";
    },
    { threshold: 0.2 }
  );

  observer.observe(waitlist);
}

document.addEventListener("DOMContentLoaded", () => {
  attachMobileMenu();
  attachBackTop();
  attachFAQ();
  attachWaitlist("waitlistForm");
  attachMobileWaitlistCTA();
});
