/**
 * Interactive Books Module for Foundry VTT v13
 * VERSIONE STABILE - Solo fix animazione freccia
 */

class InteractiveBook extends JournalSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sheet", "journal-sheet", "interactive-book"],
      template: "modules/interactive-books/templates/book-viewer.html",
      width: 960,
      height: 720,
      resizable: true,
      closeOnSubmit: false,
      submitOnClose: false
    });
  }

  constructor(object, options) {
    super(object, options);
    this._renderSpread    = this._renderSpread.bind(this);
    this._completeTurn    = this._completeTurn.bind(this);
    this._returnTurn      = this._returnTurn.bind(this);
    this._autoTurn        = this._autoTurn.bind(this);
    this._getPages        = this._getPages.bind(this);
  }

  async getData(options = {}) {
    const data = await super.getData(options);
    const pages = this._getPages();
    data.pages = pages.map((page, index) => ({
      id: page.id, name: page.name,
      text: page.text.content, index
    }));
    data.currentSpread = this.currentSpread || 0;
    data.totalPages = pages.length;
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    this.currentSpread = this.currentSpread || 0;
    this.isDragging    = false;
    this.animating     = false;
    this._cornerY      = 0.5;

    this.els = {
      pageLeft:       html.find('.book-page.left'),
      pageRight:      html.find('.book-page.right'),
      cardRight:      html.find('.page-card.card-right'),
      cardLeft:       html.find('.page-card.card-left'),
      cardRightFront: html.find('.page-card.card-right .face-front .page-content'),
      cardRightBack:  html.find('.page-card.card-right .face-back .page-content'),
      cardLeftFront:  html.find('.page-card.card-left .face-front .page-content'),
      cardLeftBack:   html.find('.page-card.card-left .face-back .page-content'),
    };

    this._keyHandler = (ev) => {
      if (this._minimized) return;
      if (!this.element || !this.element.is(':visible')) return;
      if (ev.key === 'ArrowRight') { ev.preventDefault(); this._autoTurn('forward'); }
      if (ev.key === 'ArrowLeft')  { ev.preventDefault(); this._autoTurn('backward'); }
    };
    $(document).on('keydown.booknavigation', this._keyHandler);

    if (game.settings.get('interactive-books', 'medievalStyle')) {
      html.addClass('medieval-style');
    }

    this._setupDrag();
    this._renderSpread();
  }

  _getPages() {
    return Array.from(this.object.pages.values());
  }

  _renderSpread() {
    const pages = this._getPages();
    const L = this.currentSpread * 2;
    const R = L + 1;

    this.els.pageLeft.find('.page-content').html(pages[L]?.text?.content || '');
    this.els.pageRight.find('.page-content').html(pages[R]?.text?.content || '');

    const nextL = (this.currentSpread + 1) * 2;
    if (R < pages.length && nextL < pages.length) {
      this.els.cardRightFront.html(pages[R]?.text?.content || '');
      this.els.cardRightBack.html(pages[nextL]?.text?.content || '');
      this.els.cardRight.show().css({ transform: 'rotateY(0deg)', transition: 'none' });
      this.els.cardRight.find('.face-front').css({ transform: '', transition: 'none' });
    } else {
      this.els.cardRight.hide();
    }

    const prevR = (this.currentSpread - 1) * 2 + 1;
    if (L > 0 && prevR >= 0) {
      this.els.cardLeftFront.html(pages[L]?.text?.content || '');
      this.els.cardLeftBack.html(pages[prevR]?.text?.content || '');
      this.els.cardLeft.show().css({ transform: 'rotateY(0deg)', transition: 'none' });
      this.els.cardLeft.find('.face-front').css({ transform: '', transition: 'none' });
    } else {
      this.els.cardLeft.hide();
    }
  }

  _setupDrag() {
    // ── DESTRA (avanti) ──
    this.els.cardRight.on('mousedown touchstart', (e) => {
      if (this.animating) return;
      const pages = this._getPages();
      if ((this.currentSpread + 1) * 2 >= pages.length) return;

      e.preventDefault();
      this.isDragging = true;

      const touch = e.originalEvent?.touches ? e.originalEvent.touches[0] : e;
      this._dragStartX   = touch.pageX;
      this._dragCurrentX = touch.pageX;

      const rect = this.els.cardRight[0].getBoundingClientRect();
      this._cornerY = Math.min(Math.max((touch.clientY - rect.top) / rect.height, 0), 1);

      this.els.cardRight.addClass('dragging');

      const curL  = this.currentSpread * 2;
      const nextL = (this.currentSpread + 1) * 2;
      const nextR = nextL + 1;

      this.els.pageLeft.find('.page-content').html(pages[nextL]?.text?.content || '');
      this.els.pageRight.find('.page-content').html(pages[nextR]?.text?.content || '');
      this.els.cardLeftFront.html(pages[curL]?.text?.content || '');
      this.els.cardLeft.show().css({ transform: 'rotateY(0deg)', transition: 'none' });

      const onMove = (ev) => {
        if (!this.isDragging) return;
        const t = ev.originalEvent?.touches ? ev.originalEvent.touches[0] : ev;
        this._dragCurrentX = t.pageX;

        const delta = this._dragStartX - this._dragCurrentX;
        const pct   = Math.min(Math.max(delta / this.els.cardRight.width(), 0), 1);
        const rot   = pct * 180;

        const centerOff = (this._cornerY - 0.5) * 2;
        const skew = Math.sin(pct * Math.PI) * centerOff * 7;
        const tz = -Math.abs(Math.sin(rot * Math.PI / 180)) * 10;

        this.els.cardRight.css({
          'transform': `translateZ(${tz}px) rotateY(-${rot}deg)`,
          'transition': 'none',
          'transform-origin': `left ${this._cornerY * 100}%`
        });

        this.els.cardRight.find('.face-front').css({
          'transform': `skewY(${skew}deg)`,
          'transform-origin': `left ${this._cornerY * 100}%`
        });
      };

      const onUp = () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.els.cardRight.removeClass('dragging');
        $(document).off('mousemove.bookdrag touchmove.bookdrag');
        $(document).off('mouseup.bookdrag touchend.bookdrag');

        const delta = this._dragStartX - this._dragCurrentX;
        const pct   = Math.min(Math.max(delta / this.els.cardRight.width(), 0), 1);

        if (pct > 0.35) this._completeTurn('forward', pct);
        else            this._returnTurn('forward', pct);
      };

      $(document).on('mousemove.bookdrag touchmove.bookdrag', onMove);
      $(document).on('mouseup.bookdrag touchend.bookdrag', onUp);
    });

    // ── SINISTRA (indietro) ──
    this.els.cardLeft.on('mousedown touchstart', (e) => {
      if (this.animating) return;
      if (this.currentSpread === 0) return;

      e.preventDefault();
      this.isDragging = true;

      const touch = e.originalEvent?.touches ? e.originalEvent.touches[0] : e;
      this._dragStartX   = touch.pageX;
      this._dragCurrentX = touch.pageX;

      const rect = this.els.cardLeft[0].getBoundingClientRect();
      this._cornerY = Math.min(Math.max((touch.clientY - rect.top) / rect.height, 0), 1);

      this.els.cardLeft.addClass('dragging');

      const pages = this._getPages();
      const curR  = this.currentSpread * 2 + 1;
      const prevL = (this.currentSpread - 1) * 2;
      const prevR = prevL + 1;

      this.els.pageLeft.find('.page-content').html(pages[prevL]?.text?.content || '');
      this.els.pageRight.find('.page-content').html(pages[prevR]?.text?.content || '');
      this.els.cardRightFront.html(pages[curR]?.text?.content || '');
      this.els.cardRight.show().css({ transform: 'rotateY(0deg)', transition: 'none' });

      const onMove = (ev) => {
        if (!this.isDragging) return;
        const t = ev.originalEvent?.touches ? ev.originalEvent.touches[0] : ev;
        this._dragCurrentX = t.pageX;

        const delta = this._dragCurrentX - this._dragStartX;
        const pct   = Math.min(Math.max(delta / this.els.cardLeft.width(), 0), 1);
        const rot   = pct * 180;

        const centerOff = (this._cornerY - 0.5) * 2;
        const skew = Math.sin(pct * Math.PI) * centerOff * 7;
        const tz = -Math.abs(Math.sin(rot * Math.PI / 180)) * 10;

        this.els.cardLeft.css({
          'transform': `translateZ(${tz}px) rotateY(${rot}deg)`,
          'transition': 'none',
          'transform-origin': `right ${this._cornerY * 100}%`
        });

        this.els.cardLeft.find('.face-front').css({
          'transform': `skewY(-${skew}deg)`,
          'transform-origin': `right ${this._cornerY * 100}%`
        });
      };

      const onUp = () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.els.cardLeft.removeClass('dragging');
        $(document).off('mousemove.bookdrag touchmove.bookdrag');
        $(document).off('mouseup.bookdrag touchend.bookdrag');

        const delta = this._dragCurrentX - this._dragStartX;
        const pct   = Math.min(Math.max(delta / this.els.cardLeft.width(), 0), 1);

        if (pct > 0.35) this._completeTurn('backward', pct);
        else            this._returnTurn('backward', pct);
      };

      $(document).on('mousemove.bookdrag touchmove.bookdrag', onMove);
      $(document).on('mouseup.bookdrag touchend.bookdrag', onUp);
    });
  }

  _completeTurn(dir, currentPct) {
    this.animating = true;
    const el       = dir === 'forward' ? this.els.cardRight : this.els.cardLeft;
    const duration = Math.max(180, 700 * (1 - currentPct));

    el.css({
      'transition': `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      'transform-origin': dir === 'forward'
        ? `left ${this._cornerY * 100}%`
        : `right ${this._cornerY * 100}%`
    });

    el.find('.face-front').css({
      'transition': `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      'transform-origin': dir === 'forward'
        ? `left ${this._cornerY * 100}%`
        : `right ${this._cornerY * 100}%`
    });

    this._playPageTurnSound();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const finalTz = -10;
        el.css('transform', dir === 'forward' 
          ? `translateZ(${finalTz}px) rotateY(-180deg)` 
          : `translateZ(${finalTz}px) rotateY(180deg)`);
        el.find('.face-front').css('transform', 'skewY(0deg)');
      });
    });

    setTimeout(() => {
      if (dir === 'forward') this.currentSpread++;
      else                   this.currentSpread--;
      this._renderSpread();
      this.animating = false;
    }, duration + 50);
  }

  _returnTurn(dir, currentPct) {
    this.animating = true;
    const el       = dir === 'forward' ? this.els.cardRight : this.els.cardLeft;
    const duration = Math.max(150, 400 * currentPct);

    el.css({
      'transition': `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      'transform-origin': dir === 'forward'
        ? `left ${this._cornerY * 100}%`
        : `right ${this._cornerY * 100}%`
    });

    el.find('.face-front').css({
      'transition': `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      'transform-origin': dir === 'forward'
        ? `left ${this._cornerY * 100}%`
        : `right ${this._cornerY * 100}%`
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.css('transform', 'rotateY(0deg)');
        el.find('.face-front').css('transform', 'skewY(0deg)');
      });
    });

    setTimeout(() => {
      this._renderSpread();
      this.animating = false;
    }, duration + 50);
  }

  _autoTurn(dir) {
    if (this.animating) return;
    const pages = this._getPages();

    if (dir === 'forward') {
      const nextL = (this.currentSpread + 1) * 2;
      if (nextL >= pages.length) return;

      const curL  = this.currentSpread * 2;
      const nextR = nextL + 1;

      this.els.pageLeft.find('.page-content').html(pages[nextL]?.text?.content || '');
      this.els.pageRight.find('.page-content').html(pages[nextR]?.text?.content || '');
      this.els.cardLeftFront.html(pages[curL]?.text?.content || '');
      this.els.cardLeft.show().css({ transform: 'rotateY(0deg)', transition: 'none' });

      // Applica rotazione INIZIALE al wrapper (non solo skew)
      this.els.cardRight.css({ 
        'transform': 'rotateY(-15deg)',
        'transition': 'none',
        'transform-origin': 'left 50%'
      });
      this.els.cardRight.find('.face-front').css({
        'transform': 'skewY(3deg)',
        'transition': 'none',
        'transform-origin': 'left 50%'
      });

    } else {
      if (this.currentSpread === 0) return;

      const curR  = this.currentSpread * 2 + 1;
      const prevL = (this.currentSpread - 1) * 2;
      const prevR = prevL + 1;

      this.els.pageLeft.find('.page-content').html(pages[prevL]?.text?.content || '');
      this.els.pageRight.find('.page-content').html(pages[prevR]?.text?.content || '');
      this.els.cardRightFront.html(pages[curR]?.text?.content || '');
      this.els.cardRight.show().css({ transform: 'rotateY(0deg)', transition: 'none' });

      this.els.cardLeft.css({
        'transform': 'rotateY(15deg)',
        'transition': 'none',
        'transform-origin': 'right 50%'
      });
      this.els.cardLeft.find('.face-front').css({
        'transform': 'skewY(-3deg)',
        'transition': 'none',
        'transform-origin': 'right 50%'
      });
    }

    this._cornerY = 0.5;
    // Parte da currentPct = 15/180 = 0.083 (come se avessimo già trascinato un po')
    setTimeout(() => this._completeTurn(dir, 0.083), 50);
  }

  _playPageTurnSound() {
    if (!game.settings.get('interactive-books', 'enableSounds')) return;
    const volume = game.settings.get('interactive-books', 'soundVolume');
    const s = ['sounds/paper-turn-1.mp3','sounds/paper-turn-2.mp3','sounds/paper-turn-3.mp3'];
    AudioHelper.play({ src: s[Math.floor(Math.random()*s.length)], volume }, false).catch(()=>{});
  }

  close(options = {}) {
    $(document).off('keydown.booknavigation');
    $(document).off('mousemove.bookdrag touchmove.bookdrag');
    $(document).off('mouseup.bookdrag touchend.bookdrag');
    return super.close(options);
  }
}

/* ═══════════════════════════════════════════════════ */
Hooks.once('init', () => {
  console.log('Interactive Books | Init');
  
  game.settings.register('interactive-books', 'enableSounds', {
    name:'INTERACTIVE_BOOKS.SettingEnableSounds',
    hint:'INTERACTIVE_BOOKS.SettingEnableSoundsHint',
    scope:'world', config:true, type:Boolean, default:true
  });
  
  game.settings.register('interactive-books', 'soundVolume', {
    name:'INTERACTIVE_BOOKS.SettingSoundVolume',
    hint:'INTERACTIVE_BOOKS.SettingSoundVolumeHint',
    scope:'client', config:true, type:Number,
    range:{min:0.0, max:1.0, step:0.1}, default:0.3
  });
  
  game.settings.register('interactive-books', 'animationSpeed', {
    name:'INTERACTIVE_BOOKS.SettingAnimationSpeed',
    hint:'INTERACTIVE_BOOKS.SettingAnimationSpeedHint',
    scope:'client', config:true, type:Number,
    range:{min:0.3, max:1.5, step:0.1}, default:1.0
  });
  
  game.settings.register('interactive-books', 'medievalStyle', {
    name:'INTERACTIVE_BOOKS.SettingMedievalStyle',
    hint:'INTERACTIVE_BOOKS.SettingMedievalStyleHint',
    scope:'world', config:true, type:Boolean, default:true,
    requiresReload: true
  });
});

Hooks.once('ready', () => {
  console.log('Interactive Books | Ready');
  Hooks.on('getJournalSheetHeaderButtons', (app, buttons) => {
    buttons.unshift({
      label: game.i18n.localize('INTERACTIVE_BOOKS.OpenAsBook'),
      class: 'open-as-book',
      icon:  'fas fa-book-open',
      onclick: () => {
        app.close();
        new InteractiveBook(app.object, { editable: app.options.editable }).render(true);
      }
    });
  });

  game.interactiveBooks = {
    openBook(id) {
      const j = game.journal.get(id);
      if (!j) { ui.notifications.error('Journal non trovato!'); return; }
      new InteractiveBook(j).render(true);
    },
    openBookByName(name) {
      const j = game.journal.getName(name);
      if (!j) { ui.notifications.error(`Journal "${name}" non trovato!`); return; }
      new InteractiveBook(j).render(true);
    }
  };
});
