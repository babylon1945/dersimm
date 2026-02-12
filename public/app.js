function loadContent() {
  try {
    const data = window.__CONTENT__;
    if (!data) {
      console.error("Content missing: window.__CONTENT__ not found.");
      return;
    }
    applyContent(data);
    if (window.initReveals) window.initReveals();
    initPressTicker(data);
  } catch (err) {
    console.error("Content load failed", err);
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined) {
    el.textContent = value;
  }
}

function setHtml(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined) {
    el.innerHTML = value;
  }
}

function renderLinks(container, links) {
  if (!container) return;
  container.innerHTML = "";
  (links || []).forEach((link) => {
    const a = document.createElement("a");
    a.href = link.href || "#";
    a.textContent = link.label || "";
    container.appendChild(a);
  });
}

function renderActions(container, actions) {
  if (!container) return;
  container.innerHTML = "";
  (actions || []).forEach((action) => {
    const btn = document.createElement("button");
    btn.className = action.variant || "primary";
    btn.textContent = action.label || "";
    container.appendChild(btn);
  });
}

function renderCards(container, items, className, mapper) {
  if (!container) return;
  container.innerHTML = "";
  (items || []).forEach((item) => {
    const card = document.createElement("article");
    card.className = className;
    mapper(card, item);
    container.appendChild(card);
  });
}

function formatDate(value) {
  if (!value) return "";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  }
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  }
  return value;
}

function getSourceLabel(url) {
  if (!url) return "";
  const host = url.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
  if (host.includes("pirha.org")) return "PİRHA";
  if (host.includes("bianet.org")) return "Bianet";
  if (host.includes("evrensel.net")) return "Evrensel";
  if (host.includes("rudaw.net")) return "Rûdaw";
  if (host.includes("demparti.org.tr")) return "DEM Parti";
  if (host.includes("ankahaber.net")) return "ANKA Haber";
  if (host.includes("birgun.net")) return "BirGün";
  if (host.includes("t24.com.tr")) return "T24";
  return host.replace(/^www\./, "");
}

function getSocialIcon(label, href) {
  const name = `${label || ""} ${href || ""}`.toLowerCase();
  if (name.includes("instagram")) {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm0 2a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H7zm5 3.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm4.75-4.25a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z"/></svg>'
    );
  }
  if (name.includes("facebook")) {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.3V12h2.3V9.7c0-2.3 1.4-3.6 3.5-3.6 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.4l-.4 2.9h-2v7A10 10 0 0022 12z"/></svg>'
    );
  }
  if (name.includes("youtube")) {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M21.6 7.2a3 3 0 00-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5a3 3 0 00-2.1 2.1A31.8 31.8 0 002 12a31.8 31.8 0 00.4 4.8 3 3 0 002.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 002.1-2.1A31.8 31.8 0 0022 12a31.8 31.8 0 00-.4-4.8zM10 15.5V8.5l6 3.5-6 3.5z"/></svg>'
    );
  }
  return (
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 3a9 9 0 100 18 9 9 0 000-18zm1 5h3v2h-2c-.6 0-1 .4-1 1v2h3v2h-3v4h-2v-4H8v-2h3v-2c0-1.7 1.3-3 3-3z"/></svg>'
  );
}

function normalizeSocial(input) {
  if (!input) return { label: "", href: "" };
  if (typeof input === "string") return { label: input, href: "" };
  return {
    label: input.label || input.name || "",
    href: input.href || input.url || ""
  };
}

function buildSocialItem(social) {
  const data = normalizeSocial(social);
  const item = document.createElement(data.href ? "a" : "div");
  item.className = "social-item";
  const socialKey = `${data.label || ""} ${data.href || ""}`.toLowerCase();
  if (socialKey.includes("instagram")) item.dataset.social = "instagram";
  if (socialKey.includes("facebook")) item.dataset.social = "facebook";
  if (socialKey.includes("youtube")) item.dataset.social = "youtube";
  if (data.href) {
    item.href = data.href;
    item.target = "_blank";
    item.rel = "noopener noreferrer";
  }
  const icon = document.createElement("span");
  icon.className = "social-icon";
  icon.innerHTML = getSocialIcon(data.label, data.href);
  const text = document.createElement("span");
  text.textContent = data.label || "";
  item.append(icon, text);
  return item;
}

function applyContent(data) {
  if (!data) return;

  if (data.site?.title) document.title = data.site.title;
  if (data.site?.description) {
    const meta = document.getElementById("metaDescription");
    if (meta) meta.setAttribute("content", data.site.description);
  }

  const logoMark = document.getElementById("logoMark");
  if (logoMark && data.site?.logoImage) {
    logoMark.innerHTML = "";
    const img = document.createElement("img");
    img.src = data.site.logoImage;
    img.alt = "Logo";
    logoMark.appendChild(img);
  } else {
    setText("logoMark", data.site?.logoMark);
  }
  setText("logoText", data.site?.name);
  setText("heroEyebrow", data.site?.eyebrow);

  const navLinks = document.getElementById("navLinks");
  if (navLinks && navLinks.dataset.static !== "true") {
    renderLinks(navLinks, data.nav?.links);
  }
  renderActions(document.getElementById("navActions"), data.nav?.actions);
  const mobileLinks = document.getElementById("mobileLinks");
  if (mobileLinks && mobileLinks.dataset.static !== "true") {
    renderLinks(mobileLinks, data.nav?.links);
  }
  renderActions(document.getElementById("mobileActions"), data.nav?.actions);

  setText("heroTitle", data.hero?.title);
  setText("heroSubtitle", data.hero?.subtitle);
  const heroSubtitle = document.getElementById("heroSubtitle");
  if (heroSubtitle) {
    heroSubtitle.style.display = data.hero?.subtitle ? "" : "none";
  }

  const heroActions = document.getElementById("heroActions");
  if (heroActions) {
    heroActions.innerHTML = "";
    if (data.hero?.primaryCta) {
      const primary = document.createElement("button");
      primary.className = "primary";
      primary.textContent = data.hero.primaryCta;
      if (
        typeof data.hero.primaryCta === "string" &&
        data.hero.primaryCta.toLowerCase().includes("dersim hafızası")
      ) {
        primary.classList.add("coming-soon");
        primary.disabled = true;
        primary.setAttribute("aria-disabled", "true");
        primary.setAttribute("title", "Yakında kullanıma açılacak");

        const badge = document.createElement("span");
        badge.className = "coming-soon-badge";
        badge.textContent = "Yakında";
        primary.appendChild(badge);

      }
      heroActions.appendChild(primary);
    }
    if (data.hero?.secondaryCta) {
      const secondary = document.createElement("button");
      secondary.className = "outline";
      secondary.textContent = data.hero.secondaryCta;
      heroActions.appendChild(secondary);
    }
  }

  setText("heroCardTitle", data.heroCard?.title);
  setText("heroCardName", data.heroCard?.name);
  setText("heroCardDate", data.heroCard?.date);
  setText("heroCardCta", data.heroCard?.cta);

  setText("campaignTitle", data.campaign?.title);
  setText("campaignName", data.campaign?.name);
  setText("campaignProgressLabel", data.campaign?.progressLabel);
  const progress = document.getElementById("campaignProgress");
  if (progress && typeof data.campaign?.progress === "number") {
    progress.style.width = `${data.campaign.progress}%`;
  }

  setText("boardTitle", data.board?.title);
  setText("boardSubtitle", data.board?.subtitle);
  const boardMembers = data.board?.members || [];
  const orderedMembers = [
    ...boardMembers.filter((m) => m.isPresident),
    ...boardMembers.filter((m) => !m.isPresident)
  ];
  renderCards(document.getElementById("boardGrid"), orderedMembers, "board-card reveal", (card, item) => {
    if (item.isPresident) {
      card.classList.add("president");
    }
    const name = document.createElement("h3");
    name.textContent = item.name || "";
    const role = document.createElement("div");
    role.className = "board-role";
    role.textContent = item.role || "";
    if (item.image) {
      const img = document.createElement("img");
      img.className = "board-photo";
      img.alt = item.name || "Yönetim Kurulu Üyesi";
      img.src = item.image;
      card.appendChild(img);
    } else {
      const initials = document.createElement("div");
      initials.className = "board-initials";
      const parts = String(item.name || "").split(" ").filter(Boolean);
      initials.textContent = parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
      card.appendChild(initials);
    }
    card.append(name, role);
  });

  setText("projectsTitle", data.projects?.title);
  setText("projectsSubtitle", data.projects?.subtitle);
  renderCards(document.getElementById("projectsGrid"), data.projects?.items, "project-card reveal", (card, item) => {
    const h3 = document.createElement("h3");
    h3.textContent = item.title || "";
    const p = document.createElement("p");
    p.textContent = item.body || "";
    const span = document.createElement("span");
    span.textContent = item.tag || "";
    card.append(h3, p, span);
  });

  setText("eventsTitle", data.events?.title);
  setText("eventsSubtitle", data.events?.subtitle);
  const eventsTimeline = document.getElementById("eventsTimeline");
  if (eventsTimeline) {
    eventsTimeline.innerHTML = "";
    (data.events?.items || []).forEach((event) => {
      const row = document.createElement("div");
      row.className = "event reveal";
      const date = document.createElement("span");
      date.className = "date";
      date.textContent = event.date || "";
      const wrap = document.createElement("div");
      const h3 = document.createElement("h3");
      h3.textContent = event.title || "";
      const p = document.createElement("p");
      p.textContent = event.body || "";
      wrap.append(h3, p);
      row.append(date, wrap);
      eventsTimeline.appendChild(row);
    });
  }

  setText("newsTitle", data.news?.title);
  setText("newsSubtitle", data.news?.subtitle);
  renderCards(document.getElementById("newsGrid"), data.news?.items, "news-card reveal", (card, item) => {
    if (item.url) {
      card.classList.add("is-clickable");
      card.tabIndex = 0;
      card.setAttribute("role", "link");
      card.setAttribute("aria-label", item.title || "Habere git");
      const openLink = () => window.open(item.url, "_blank", "noopener,noreferrer");
      card.addEventListener("click", (event) => {
        if (event.target.closest("a")) return;
        openLink();
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLink();
        }
      });
    }

    const media = document.createElement("div");
    media.className = "news-media";
    const img = document.createElement("img");
    img.src = item.image || "assets/logo.jpg";
    img.alt = item.title || "Haber görseli";
    img.loading = "lazy";
    media.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "news-meta";
    const sourceLabel = item.source || getSourceLabel(item.url);
    const dateLabel = item.date ? formatDate(item.date) : "";
    meta.textContent = dateLabel ? `${sourceLabel} • ${dateLabel}` : sourceLabel;

    const h3 = document.createElement("h3");
    h3.textContent = item.title || "";
    const link = document.createElement("a");
    link.className = "link";
    link.textContent = item.linkLabel || "Detaylar";
    link.href = item.url || "#";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    card.append(media, meta, h3, link);
  });

  setText("pressTitle", data.press?.title);
  setText("pressSubtitle", data.press?.subtitle);

  setText("donateTitle", data.donate?.title);
  setText("donateBody", data.donate?.body);
  setText("donatePrimaryCta", data.donate?.primaryCta);
  setText("donatePackagesTitle", data.donate?.packagesTitle);
  setText("donateSecondaryCta", data.donate?.secondaryCta);
  const donatePackages = document.getElementById("donatePackages");
  if (donatePackages) {
    donatePackages.innerHTML = "";
    (data.donate?.packages || []).forEach((pkg) => {
      const li = document.createElement("li");
      li.textContent = pkg;
      donatePackages.appendChild(li);
    });
  }

  setText("galleryTitle", data.gallery?.title);
  setText("gallerySubtitle", data.gallery?.subtitle);
  const galleryGrid = document.getElementById("galleryGrid");
  if (galleryGrid) {
    galleryGrid.innerHTML = "";
    (data.gallery?.items || []).forEach((item) => {
      const div = document.createElement("div");
      const sizeClass = item.size && item.size !== "normal" ? ` ${item.size}` : "";
      const paletteClass = item.palette ? ` palette-${item.palette}` : "";
      div.className = `tile${sizeClass}${paletteClass} reveal`;
      if (item.image) {
        div.style.backgroundImage = `url('${item.image}')`;
      }
      if (item.background) {
        div.style.background = item.background;
      }
      galleryGrid.appendChild(div);
    });
  }

  setText("volunteerTitle", data.volunteer?.title);
  setText("volunteerBody", data.volunteer?.body);
  setText("volunteerCta", data.volunteer?.cta);

  setText("footerTitle", data.footer?.title);
  setText("footerTagline", data.footer?.tagline);
  setText("footerContactTitle", data.footer?.contactTitle);
  setText("footerAddress", data.footer?.address);
  setText("footerPhone", data.footer?.phone);
  setText("footerEmail", data.footer?.email);
  setText("footerSocialTitle", data.footer?.socialTitle);
  setText("footerCopyright", data.footer?.copyright);

  const socials = document.getElementById("footerSocials");
  if (socials) {
    socials.innerHTML = "";
    (data.footer?.socials || []).forEach((social) => {
      socials.appendChild(buildSocialItem(social));
    });
  }

  const contactAddress = document.getElementById("contactAddress");
  if (contactAddress && data.footer?.address) {
    contactAddress.textContent = data.footer.address;
  }
  const contactPhone = document.getElementById("contactPhone");
  if (contactPhone && data.footer?.phone) {
    contactPhone.textContent = data.footer.phone;
    contactPhone.href = `tel:${data.footer.phone.replace(/\s+/g, "")}`;
  }
  const contactPhoneText = document.getElementById("contactPhone");
  if (contactPhoneText && data.footer?.phone && contactPhoneText.tagName === "P") {
    contactPhoneText.textContent = data.footer.phone;
  }
  const contactEmail = document.getElementById("contactEmail");
  if (contactEmail && data.footer?.email) {
    contactEmail.textContent = data.footer.email;
    contactEmail.href = `mailto:${data.footer.email}`;
  } else if (contactEmail) {
    contactEmail.style.display = "none";
  }
  const contactPhoneBtn = document.getElementById("contactPhoneBtn");
  if (contactPhoneBtn && data.footer?.phone) {
    contactPhoneBtn.href = `tel:${data.footer.phone.replace(/\s+/g, "")}`;
  }
  const footerPhoneBtn = document.getElementById("footerPhoneBtn");
  if (footerPhoneBtn && data.footer?.phone) {
    footerPhoneBtn.href = `tel:${data.footer.phone.replace(/\s+/g, "")}`;
  }
  document.querySelectorAll(".phone-btn").forEach((btn) => {
    if (btn.querySelector(".phone-icon")) return;
    const label = btn.textContent.trim() || "Hemen Ara";
    btn.innerHTML = "";
    const icon = document.createElement("span");
    icon.className = "phone-icon";
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M6.6 2.9c.3-.4.8-.6 1.3-.5l3.1.6c.6.1 1 .6 1.1 1.2l.3 2.6c.1.6-.2 1.2-.7 1.5l-1.8 1.1a13.9 13.9 0 006.3 6.3l1.1-1.8c.3-.5.9-.8 1.5-.7l2.6.3c.6.1 1.1.6 1.2 1.1l.6 3.1c.1.5-.1 1-.5 1.3l-2.2 1.8c-.3.2-.7.4-1.1.4-8.9 0-16.1-7.2-16.1-16.1 0-.4.2-.8.4-1.1l1.8-2.2z"/></svg>';
    const text = document.createElement("span");
    text.className = "phone-label";
    text.textContent = label;
    btn.append(icon, text);
  });
  const contactSocials = document.getElementById("contactSocials");
  if (contactSocials) {
    contactSocials.innerHTML = "";
    contactSocials.classList.add("social-list");
    (data.footer?.socials || []).forEach((social) => {
      contactSocials.appendChild(buildSocialItem(social));
    });
  }
}

function initPressTicker(data) {
  const widget = document.getElementById("pressWidget");
  const linkEl = document.getElementById("pressTickerLink");
  const metaEl = document.getElementById("pressTickerMeta");
  const imageEl = document.getElementById("pressTickerImage");
  const mediaEl = document.getElementById("pressTickerMedia");
  if (!widget || !linkEl || !metaEl) return;

  const items = (data.press?.items?.length ? data.press.items : data.news?.items || []).filter(
    (item) => item && item.title && item.url
  );
  if (!items.length) {
    widget.style.display = "none";
    return;
  }

  let index = 0;
  const render = () => {
    const item = items[index];
    linkEl.textContent = item.title || "";
    linkEl.href = item.url || "#";
    if (mediaEl) {
      mediaEl.setAttribute("role", "link");
      mediaEl.setAttribute("tabindex", "0");
      mediaEl.setAttribute("aria-label", item.title || "Basında Biz");
      const openLink = () => window.open(item.url || "#", "_blank", "noopener,noreferrer");
      mediaEl.onclick = (event) => {
        event.preventDefault();
        openLink();
      };
      mediaEl.onkeydown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLink();
        }
      };
    }
    const sourceLabel = item.source || getSourceLabel(item.url);
    const dateLabel = item.date ? formatDate(item.date) : "";
    metaEl.textContent = dateLabel ? `${sourceLabel} • ${dateLabel}` : sourceLabel;
    if (imageEl && mediaEl) {
      if (item.image) {
        imageEl.src = item.image;
        imageEl.alt = item.title || "Basında Biz";
        mediaEl.classList.remove("is-empty");
      } else {
        imageEl.removeAttribute("src");
        mediaEl.classList.add("is-empty");
      }
    }
  };

  render();
  if (items.length > 1) {
    setInterval(() => {
      index = (index + 1) % items.length;
      render();
    }, 6000);
  }
}

loadContent();
