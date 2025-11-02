document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("add-btn");
    const overlay = document.getElementById("overlay");
    const cancelBtn = document.getElementById("cancel");
    const addForm = document.getElementById("add-form");

    const moviesGrid = document.getElementById("movies-grid");
    const showsGrid = document.getElementById("shows-grid");
    const animeshowGrid = document.getElementById("animeshow-grid");
    const animemovieGrid = document.getElementById("animemovie-grid");
    const categoryRow = document.getElementById("category-row");
    const categorySelect = document.getElementById("category");
    const watchlistGrid = document.getElementById("watchlist-grid");


    

    // Kategorie-Auswahl bei Show und Movie anzeigen
    if (document.getElementById("type") && categoryRow) {
        document.getElementById("type").addEventListener("change", function() {
            // Zeige Kategorie immer, egal ob Show oder Movie
            categoryRow.style.display = "block";
        });
        // Initial anzeigen (falls Movie vorausgewählt)
        categoryRow.style.display = "block";
    }
    

    // Overlay öffnen
    if (addBtn && overlay) {
        addBtn.addEventListener("click", (e) => {
            e.preventDefault();
            overlay.style.display = "flex";
        });
    }

    // Overlay schließen
    if (cancelBtn && overlay && addForm) {
        cancelBtn.addEventListener("click", () => {
            overlay.style.display = "none";
            addForm.reset();
            if (categoryRow) categoryRow.style.display = "none";
        });
    }

    // Overlay für Detailansicht dynamisch erzeugen
    let detailOverlay = document.getElementById("detail-overlay");
    let detailContainer = document.getElementById("detail-container");

    if (!detailOverlay) {
        detailOverlay = document.createElement("div");
        detailOverlay.className = "overlay";
        detailOverlay.id = "detail-overlay";
        detailOverlay.style.zIndex = "3000";
        detailOverlay.style.display = "none";
        detailOverlay.innerHTML = `<div class="detail-container" id="detail-container"></div>`;
        document.body.appendChild(detailOverlay);
        detailContainer = detailOverlay.querySelector(".detail-container");
    }
    

    // Card erstellen und Click-Handler für Detailansicht + Watchlist
    function createCard(cardData) {
        const card = document.createElement("div");
        card.classList.add("card");

        const img = document.createElement("img");
        img.src = cardData.image || "https://i.pinimg.com/736x/f2/73/f8/f273f886579f46815f1e272a48c0c592.jpg";
        card.appendChild(img);

        const content = document.createElement("div");
        content.classList.add("card-content");

        const title = document.createElement("h3");
        title.textContent = `${cardData.name} (${cardData.type})`;
        content.appendChild(title);

        if (cardData.desc) {
            const description = document.createElement("p");
            description.textContent = cardData.desc;
            content.appendChild(description);
        }

        if (cardData.season || cardData.episode) {
            const info = document.createElement("p");
            info.style.color = "#b026ff";
            info.textContent = `Staffel ${cardData.season || "-"}, Folge ${cardData.episode || "-"}`;
            content.appendChild(info);
        }

        card.appendChild(content);

        // Klick für Detailansicht und Bearbeitung
        card.addEventListener("click", () => {
            showDetailOverlay(cardData, card);
        });

        return card;
    }

    // Card speichern (immer nur eine Instanz pro Beitrag, Watchlist ist Flag)
    function saveCard(cardData) {
        let cards = JSON.parse(localStorage.getItem("notiq_cards") || "[]");
        // Unterscheide nach name, type, category
        const idx = cards.findIndex(c =>
            (c.name || "") === (cardData.name || "") &&
            (c.type || "") === (cardData.type || "") &&
            (c.category || "") === (cardData.category || "")
        );
        if (idx !== -1) {
            cards[idx] = {...cards[idx], ...cardData};
        } else {
            cards.push(cardData);
        }
        localStorage.setItem("notiq_cards", JSON.stringify(cards));
    }

    // Card entfernen (löscht Eintrag komplett)
    function removeCard(cardData) {
        let cards = JSON.parse(localStorage.getItem("notiq_cards") || "[]");
        cards = cards.filter(c =>
            !((c.name || "") === (cardData.name || "") &&
              (c.type || "") === (cardData.type || "") &&
              (c.category || "") === (cardData.category || ""))
        );
        localStorage.setItem("notiq_cards", JSON.stringify(cards));
    }

    // Grids aktualisieren basierend auf Suchergebnissen
    function updateGrids(cards) {
  if (moviesGrid) moviesGrid.innerHTML = "";
  if (showsGrid) showsGrid.innerHTML = "";
  if (animeshowGrid) animeshowGrid.innerHTML = "";
  if (animemovieGrid) animemovieGrid.innerHTML = "";
  if (watchlistGrid) watchlistGrid.innerHTML = "";

  cards.forEach(cardData => {
    const card = createCard(cardData);
    if (cardData.inWatchlist && watchlistGrid) {
      watchlistGrid.appendChild(card);
    } else if (cardData.type === "movie" && cardData.category === "anime" && animemovieGrid) {
      animemovieGrid.appendChild(card);
    } else if (cardData.type === "show" && cardData.category === "anime" && animeshowGrid) {
      animeshowGrid.appendChild(card);
    } else if (cardData.type === "show" && (cardData.category === "show" || cardData.category === "movie") && showsGrid) {
      showsGrid.appendChild(card);
    } else if (cardData.type === "movie" && (cardData.category === "movie" || cardData.category === "show") && moviesGrid) {
      moviesGrid.appendChild(card);
    }
  });
  }


    // Cards laden und in die richtigen Grids einfügen
    function loadCardsForPage() {
        let cards = JSON.parse(localStorage.getItem("notiq_cards") || "[]");
        if (moviesGrid) {
            moviesGrid.innerHTML = "";
            cards.filter(c =>
                c.type === "movie" &&
                (c.category === "movie" || c.category === "show" || !c.category) &&
                !c.inWatchlist
            ).forEach(cardData => {
                moviesGrid.appendChild(createCard(cardData));
            });
        }
        if (showsGrid) {
            showsGrid.innerHTML = "";
            cards.filter(c =>
                c.type === "show" &&
                (c.category === "show" || c.category === "movie" || !c.category) &&
                !c.inWatchlist
            ).forEach(cardData => {
                showsGrid.appendChild(createCard(cardData));
            });
        }
        if (animeshowGrid) {
            animeshowGrid.innerHTML = "";
            cards.filter(c =>
                c.type === "show" &&
                c.category === "anime" &&
                !c.inWatchlist
            ).forEach(cardData => {
                animeshowGrid.appendChild(createCard(cardData));
            });
        }
        if (animemovieGrid) {
            animemovieGrid.innerHTML = "";
            cards.filter(c =>
                c.type === "movie" &&
                c.category === "anime" &&
                !c.inWatchlist
            ).forEach(cardData => {
                animemovieGrid.appendChild(createCard(cardData));
            });
        }
        if (watchlistGrid) {
            watchlistGrid.innerHTML = "";
            cards.filter(c => c.inWatchlist).forEach(cardData => {
                watchlistGrid.appendChild(createCard(cardData));
            });
        }
    }

    

    // Zufällige Cards für Vorschau unten
    function getRandomCards(currentCard, count = 6) {
        let cards = JSON.parse(localStorage.getItem("notiq_cards") || "[]");
        // Filtere die aktuelle Card raus
        cards = cards.filter(c =>
            !(c.name === currentCard.name &&
              c.type === currentCard.type &&
              (c.category || "show") === (currentCard.category || "show"))             
              /* (c.category || "movie") === (currentCard.category || "movie"))*/

        );
        // Shuffle
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        return cards.slice(0, count);
    }




    // Coolen Titel generieren (max 30 Zeichen, sonst abschneiden)
    function getCoolTitle(name) {
        if (!name) return "Unbenannt";
        return name.length > 30 ? name.substring(0, 27) + "..." : name;
    }



function showDetailOverlay(cardData, cardElement) {
  const randomCards = getRandomCards(cardData, 6);

  detailContainer.innerHTML = `
    <div id="container-main" style="display:flex; gap:40px; align-items:flex-start; margin-bottom:60px;">
      <div style="flex:1;">
        <h2 style="color:#b026ff; margin-bottom:30px;" contenteditable="true" id="edit-title">${getCoolTitle(cardData.name)}</h2>

        <label for="edit-desc" style="color:#fff; font-weight:bold;">Beschreibung</label>
        <textarea id="edit-desc" style="width:100%; background:#181825; color:#fff; border:none; border-radius:5px; padding:12px; margin-bottom:24px;">${cardData.desc || ""}</textarea>

        <div style="display:flex; margin-bottom:24px;">
          <div style="flex:1;">
            <label for="edit-season" style="color:#fff; font-weight:bold;">Staffel</label>
            <input type="number" id="edit-season" value="${cardData.season || ""}" 
                   style="width:100%; background:#181825; color:#fff; border:none; border-radius:5px; padding:10px; margin:0;" />
          </div>
          <div style="flex:1;">
            <label for="edit-episode" style="color:#fff; font-weight:bold;">Folge</label>
            <input type="number" id="edit-episode" value="${cardData.episode || ""}" 
                   style="width:100%; background:#181825; color:#fff; border:none; border-radius:5px; padding:10px; margin:0;" />
          </div>
        </div>

        <label for="edit-image" style="color:#fff; font-weight:bold;">Bild URL</label>
        <input type="url" id="edit-image" value="${cardData.image || ""}" placeholder="Bild URL" 
               style="width:100%; background:#181825; color:#fff; border:none; border-radius:5px; padding:10px; margin-bottom:12px;" />

        <div style="color:#888; font-size:0.85rem; margin-bottom:24px;">
          Vorschau: <span style="word-break:break-all;">${cardData.image?.slice(0, 40) || "https://..."}...</span>
        </div>

        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <button id="save-changes-btn" class="detail-image-btn">Speichern</button>
          <button id="toggle-watchlist-btn" style="background:#b026ff;color:#fff;padding:10px 24px;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">
            ${cardData.inWatchlist ? "Aus Watchlist entfernen" : "Zur Watchlist hinzufügen"}
          </button>
          <button id="remove-card-btn" style="background:#ff2e2e;color:#fff;padding:10px 24px;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">
            Entfernen
          </button>
        </div>
      </div>

      <div style="flex:0 0 240px;">
        <img src="${cardData.image || "https://i.pinimg.com/736x/f2/73/f8/f273f886579f46815f1e272a48c0c592.jpg"}" 
             style="width:100%; height:380px; object-fit:cover; border-radius:8px;" />
      </div>
    </div>

    <h3 style="color:#b026ff; margin-bottom:20px;">Empfehlungen</h3>

    <div class="emp" style="display:flex; flex-wrap:wrap; gap:24px;">
      ${randomCards.map(c => `
        <div class="detail-preview-card" data-name="${c.name}"
             style="width:140px; background:#0f0f17; padding:14px; border-radius:6px; text-align:center; cursor:pointer;">
          <img src="${c.image || "https://i.pinimg.com/736x/f2/73/f8/f273f886579f46815f1e272a48c0c592.jpg"}" 
               style="width:100%; height:140px; object-fit:cover; border-radius:4px;" />
          <h4 style="color:#fff; font-size:1rem; margin:12px 0 6px;">${getCoolTitle(c.name)}</h4>
          <p style="color:#aaa; font-size:0.85rem;">${c.desc || "Show / movie"}</p>
        </div>
      `).join("")}
    </div>

    <button id="close-detail" style="position:absolute; top:15px; right:15px; background:#b026ff; color:#fff; border:none; border-radius:50%; width:32px; height:32px; font-size:1.2rem; cursor:pointer;">
      &times;
    </button>
  `;

  // Overlay anzeigen
  detailOverlay.style.display = "flex";

  // Schließen
  document.getElementById("close-detail").onclick = () => {
    detailOverlay.style.display = "none";
  };

  // 🔹 Änderungen speichern
  document.getElementById("save-changes-btn").onclick = () => {
    cardData.name = document.getElementById("edit-title").textContent.trim();
    cardData.desc = document.getElementById("edit-desc").value.trim();
    cardData.season = document.getElementById("edit-season").value.trim();
    cardData.episode = document.getElementById("edit-episode").value.trim();
    cardData.image = document.getElementById("edit-image").value.trim();
    saveCard(cardData);
    loadCardsForPage();
    detailOverlay.style.display = "none";
  };

  // 🔹 Watchlist umschalten
  document.getElementById("toggle-watchlist-btn").onclick = () => {
    cardData.inWatchlist = !cardData.inWatchlist;
    saveCard(cardData);
    loadCardsForPage();
    detailOverlay.style.display = "none";
  };

  // 🔹 Karte löschen
  document.getElementById("remove-card-btn").onclick = () => {
    if (confirm(`"${cardData.name}" wirklich löschen?`)) {
      removeCard(cardData);
      loadCardsForPage();
      detailOverlay.style.display = "none";
    }
  };

  // 🔹 Empfehlungen klickbar machen
  detailContainer.querySelectorAll(".detail-preview-card").forEach(card => {
    card.addEventListener("click", () => {
      const name = card.dataset.name;
      const allCards = JSON.parse(localStorage.getItem("notiq_cards") || "[]");
      const match = allCards.find(c => c.name === name);
      if (match) showDetailOverlay(match);
    });
  });



function showDeleteConfirm(cardData) {
  const confirmOverlay = document.createElement("div");
  confirmOverlay.style.position = "fixed";
  confirmOverlay.style.top = "0";
  confirmOverlay.style.left = "0";
  confirmOverlay.style.width = "100vw";
  confirmOverlay.style.height = "100vh";
  
  confirmOverlay.style.background = "rgba(0,0,0,0.8)";
  confirmOverlay.style.display = "flex";
  confirmOverlay.style.alignItems = "center";
  confirmOverlay.style.justifyContent = "center";
  confirmOverlay.style.zIndex = "9999";

  confirmOverlay.innerHTML = `
    <div style="background:#1a1a25; padding:30px; border-radius:10px; text-align:center; width:300px; box-shadow:0 0 20px #b026ff;">
      <h3 style="color:#fff; margin-bottom:20px;">Wirklich löschen?</h3>
      <p style="color:#aaa; font-size:0.9rem; margin-bottom:24px;">
        "${getCoolTitle(cardData.name)}" wird dauerhaft entfernt.
 </p>
      <div style="display:flex; justify-content:center; gap:12px;">
        <button id="confirm-delete" style="background:#ff2e2e; color:#fff; padding:8px 16px; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
          Löschen
        </button>
        <button id="cancel-delete" style="background:#444; color:#fff; padding:8px 16px; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
          Abbrechen
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(confirmOverlay);

    // 🔹 Bestätigungs-Dialog für Löschen anzeigen
  document.getElementById("confirm-delete").onclick = () => {
    removeCard(cardData);         // deine Löschfunktion
    loadCardsForPage();           // UI aktualisieren
    confirmOverlay.remove();      // Dialog schließen
    detailOverlay.style.display = "none"; // Detail-Overlay schließen
  };

    document.getElementById("cancel-delete").onclick = () => {
    confirmOverlay.remove();
  };
}


  // 🔹 Entfernen-Button
document.getElementById("remove-card-btn").onclick = () => {
  showDeleteConfirm(cardData);
};  

// 🔹 Watchlist-Button
document.getElementById("toggle-watchlist-btn").onclick = () => {
  cardData.inWatchlist = !cardData.inWatchlist;
  saveCard(cardData);
  loadCardsForPage();
  detailOverlay.style.display = "none";
};

// 🔹 Speichern-Button für Bild-URL
document.getElementById("save-image-btn").onclick = () => {
  const newImage = document.getElementById("edit-image").value;
  if (newImage) {
    cardData.image = newImage;
    saveCard(cardData);
    loadCardsForPage();
    detailOverlay.style.display = "none";
  }
};

 // ⌨️ Speichern bei Enter in einem beliebigen Eingabefeld
 ["edit-desc", "edit-season", "edit-episode", "edit-image"].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault(); // verhindert Zeilenumbruch in textarea
        saveChanges();
      }
    });
  }
 });

        detailOverlay.style.display = "flex";
        document.getElementById("close-detail").onclick = () => {
            detailOverlay.style.display = "none";
        };

            // Empfehlungen klickbar machen
      detailContainer.querySelectorAll(".detail-preview-card").forEach(card => {
      card.addEventListener("click", () => {
       const name = card.dataset.name;
       const allCards = JSON.parse(localStorage.getItem("notiq_cards") || "[]");
       const match = allCards.find(c => c.name === name);
         if (match) showDetailOverlay(match);
          });
        });

        // Inline-Edit Name
        document.getElementById("edit-title").onclick = function() {
            const input = document.createElement("input");
            input.type = "text";
            input.value = cardData.name;
            input.className = "detail-title-cool";
            input.style.width = "400px";
            input.onblur = function() {
                cardData.name = input.value;
                saveCard(cardData);
                loadCardsForPage();
                detailOverlay.style.display = "none";
            };
            this.innerHTML = "";
            this.appendChild(input);
            input.focus();
        };

    // 🔹 Alle Änderungen speichern (Beschreibung, Staffel, Folge, Bild)
    document.getElementById("save-image-btn").onclick = () => {
    const newDesc = document.getElementById("edit-desc").value.trim();
    const newSeason = document.getElementById("edit-season").value.trim();
    const newEpisode = document.getElementById("edit-episode").value.trim();
    const newImage = document.getElementById("edit-image").value.trim();

    // Änderungen ins aktuelle Objekt übernehmen
    cardData.desc = newDesc;
    cardData.season = newSeason;
    cardData.episode = newEpisode;
    if (newImage) cardData.image = newImage;

    // In localStorage speichern
    saveCard(cardData);

    // Oberfläche neu laden
    loadCardsForPage();

    // Detailfenster schließen
    detailOverlay.style.display = "none";
    };


        // Watchlist hinzufügen/entfernen (nur Flag setzen, Card bleibt erhalten)
        document.getElementById("toggle-watchlist-btn").onclick = () => {
            cardData.inWatchlist = !cardData.inWatchlist;
            saveCard(cardData);
            loadCardsForPage();
            detailOverlay.style.display = "none";
        };

        // Entfernen-Button mit Overlay-Bestätigung (löscht Card überall)
        document.getElementById("remove-card-btn").onclick = () => {
            const confirmOverlay = document.getElementById("delete-confirm-overlay");
            confirmOverlay.style.display = "flex";
            document.getElementById("delete-confirm-btn").onclick = () => {
                removeCard(cardData);
                loadCardsForPage();
                confirmOverlay.style.display = "none";
                detailOverlay.style.display = "none";
            };
            document.getElementById("delete-cancel-btn").onclick = () => {
                confirmOverlay.style.display = "none";
            };
        };

        function updateInfo() {
            if (cardElement.querySelector("p")) {
                cardElement.querySelector("p").textContent =
                    `Staffel ${cardData.season || "-"}, Folge ${cardData.episode || "-"}`;
            }
        }
    }

    // Overlay schließen
    if (cancelBtn && overlay && addForm) {
        cancelBtn.addEventListener("click", () => {
            overlay.style.display = "none";
            addForm.reset();
            if (categoryRow) categoryRow.style.display = "none";
        });
    }

    // Formular absenden
    if (addForm) {
        addForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const type = document.getElementById("type").value;
            const name = document.getElementById("name").value;
            const desc = document.getElementById("desc").value;
            const season = document.getElementById("season").value;
            const episode = document.getElementById("episode").value;
            const image = document.getElementById("image").value;
            let category = categorySelect ? categorySelect.value : (type === "movie" ? "movie" : "show");

            const cardData = {type, name, desc, season, episode, image, category};
            saveCard(cardData);

            // Card in das richtige Grid einfügen (nur für Sofort-Vorschau, eigentliche Anzeige über loadCardsForPage)
            if (type === "movie" && category === "anime" && animemovieGrid) {
                animemovieGrid.appendChild(createCard(cardData));
            } else if (type === "show" && category === "anime" && animeshowGrid) {
                animeshowGrid.appendChild(createCard(cardData));
            } else if (type === "show" && showsGrid && (category === "show" || category === "movie")) {
                showsGrid.appendChild(createCard(cardData));
            } else if (type === "movie" && moviesGrid && (category === "movie" || category === "show")) {
                moviesGrid.appendChild(createCard(cardData));
            }

            overlay.style.display = "none";
            addForm.reset();
            if (categoryRow) categoryRow.style.display = "none";
            loadCardsForPage();
        });
    }

    // Beim Laden Cards aus LocalStorage einfügen
    loadCardsForPage();
 });

 document.addEventListener("DOMContentLoaded", function () {
    const season = document.getElementById("season").value;
    const episode = document.getElementById("episode").value;
    const image = document.getElementById("image").value;
    let category = "show";
    if (type === "show" && categorySelect) {
        category = categorySelect.value;
    }
    
    if (type === "movie" && categorySelect) {
        category = categorySelect.value;
    }  

    const cardData = {type, name, desc, season, episode, image, category};
    saveCard(cardData);

    // Card in das richtige Grid einfügen
    if        (type === "movie" && category === "anime" && animemovieGrid) {
        animemovieGrid.appendChild(createCard(cardData));
    } else if (type === "show" && category === "anime" && animeshowGrid) {
        animeshowGrid.appendChild(createCard(cardData));
    } else if (type === "show" && showsGrid && category !== "anime") {
        showsGrid.appendChild(createCard(cardData));
    } else if (type === "movie" && moviesGrid && category !== "anime") {
        moviesGrid.appendChild(createCard(cardData));
    }

    overlay.style.display = "none";
    addForm.reset();
    if (categoryRow) categoryRow.style.display = "none";

    // Beim Laden Cards aus LocalStorage einfügen
    loadCardsForPage();
});
document.addEventListener("DOMContentLoaded", () => {
    // Formular zurücksetzen
    if (addForm) {
        addForm.reset();
    }

    // Kategoriezeile ausblenden, falls vorhanden
    if (categoryRow) {
        categoryRow.style.display = "none";
    }

    // Karten aus dem LocalStorage laden
    loadCardsForPage();
});


