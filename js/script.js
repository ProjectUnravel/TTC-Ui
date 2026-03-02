document.addEventListener('DOMContentLoaded',function(){
  // set year in footers
  document.querySelectorAll('#year,#year2,#year3,#year4,#year5').forEach(el=>{if(el) el.textContent=new Date().getFullYear()});

  // nav toggle for mobile
  const navToggle=document.querySelector('.nav-toggle');
  const mainNav=document.getElementById('main-nav');
  navToggle && navToggle.addEventListener('click',()=>{
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });

  // dropdowns on mobile
  document.querySelectorAll('.has-dropdown > a').forEach(anchor=>{
    anchor.addEventListener('click', (e)=>{
      if(window.innerWidth <= 900){
        e.preventDefault();
        const parent = anchor.parentElement;
        parent.classList.toggle('open');
      }
    });
  });

  // Lightbox for photo gallery
  const photoGrid = document.getElementById('photoGrid');
  const lightbox = document.getElementById('lightbox');
  if(photoGrid && lightbox){
    photoGrid.querySelectorAll('figure img').forEach(img=>{
      img.addEventListener('click', ()=>{
        lightbox.setAttribute('aria-hidden','false');
        lightbox.querySelector('.lightbox-img').src = img.src;
        lightbox.querySelector('.lightbox-img').alt = img.alt || '';
        lightbox.querySelector('.lightbox-caption').textContent = img.closest('figure').querySelector('figcaption')?.textContent || '';
      });
    });
    lightbox.querySelector('.lightbox-close').addEventListener('click', ()=>{
      lightbox.setAttribute('aria-hidden','true');
      lightbox.querySelector('.lightbox-img').src = '';
    });
    lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox){ lightbox.setAttribute('aria-hidden','true'); lightbox.querySelector('.lightbox-img').src = ''; } });
  }

  // Register form validation
  const regForm = document.getElementById('registerForm');
  if(regForm){
    // Enhanced inline validation with field-level messages
    function showFieldError(input, message){
      const field = input.closest('.field') || input.closest('.gender-field') || input.parentElement;
      const icon = field && field.querySelector('.field-icon');
      const err = field && field.querySelector('.field-error');
      if(icon) icon.style.display = 'block';
      if(err){ err.textContent = message || err.textContent || 'Required'; err.style.display = 'block'; }
      input && input.setAttribute('aria-invalid','true');
    }
    function clearFieldError(input){
      const field = input.closest('.field') || input.closest('.gender-field') || input.parentElement;
      const icon = field && field.querySelector('.field-icon');
      const err = field && field.querySelector('.field-error');
      if(icon) icon.style.display = 'none';
      if(err) { err.textContent = ''; err.style.display = 'none'; }
      input && input.removeAttribute('aria-invalid');
    }

    function validateField(input){
      if(!input) return true;
      const validity = input.validity;
      if(validity.valid) { clearFieldError(input); return true; }
      // produce friendly messages
      if(validity.valueMissing) return 'This field is required.';
      if(validity.typeMismatch) return 'Please enter a valid value.';
      if(validity.patternMismatch) return 'Please match the requested format.';
      return 'Please fill out this field.';
    }

    // live validation on input/change (inputs + selects)
    // only update "filled" state on input/select, but do not validate until submit
    regForm.querySelectorAll('input, select').forEach(inp=>{
      function updateFilled(){
        const field = inp.closest('.field');
        if(!field) return;
        if(inp.tagName.toLowerCase() === 'select'){
          if(inp.value) field.classList.add('filled'); else field.classList.remove('filled');
        } else {
          if(inp.value && inp.value.trim() !== '') field.classList.add('filled'); else field.classList.remove('filled');
        }
      }
      inp.addEventListener('input', ()=>{
        updateFilled();
      });
      // initialize filled state on load
      updateFilled();
    });

    regForm.addEventListener('submit', function(e){
      e.preventDefault();
      // hide any existing error blocks/icons first; we'll show only the errors found on this submit
      regForm.querySelectorAll('.field-error').forEach(fe => { fe.style.display = 'none'; });
      regForm.querySelectorAll('.field-icon').forEach(fi => { fi.style.display = 'none'; });
      let firstInvalid = null;
      // validate inputs and selects
      regForm.querySelectorAll('input, select').forEach(inp=>{
        if(inp.type === 'radio') return; // radios not used here
        const msg = validateField(inp);
        if(msg === true) clearFieldError(inp); else { showFieldError(inp,msg); if(!firstInvalid) firstInvalid = inp; }
      });

      // gender select
      const genderSelect = regForm.querySelector('select[name="gender"]');
      if(genderSelect){
        if(!genderSelect.value){
          showFieldError(genderSelect, 'Select a gender.');
          if(!firstInvalid) firstInvalid = genderSelect;
        } else {
          clearFieldError(genderSelect);
        }
      }

      if(firstInvalid){ firstInvalid.focus(); return; }

      // all good — simulate submit
      alert('Registration submitted — thank you!');
      regForm.reset();
      // clear errors display
      regForm.querySelectorAll('input, select').forEach(i=>clearFieldError(i));
    });
    
  }

  // Contact form validation
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      if(!contactForm.checkValidity()){
        e.preventDefault();
        contactForm.querySelector(':invalid')?.focus();
        alert('Please complete the contact form.');
      } else {
        e.preventDefault();
        alert('Message sent — thank you!');
        contactForm.reset();
      }
    });
  }

  // Event registration modal handling
  const registerButtons = document.querySelectorAll('.register-event');
  const eventModalEl = document.getElementById('eventRegisterModal');
  if(registerButtons && eventModalEl){
    const bootstrapModal = new bootstrap.Modal(eventModalEl);
    registerButtons.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const evName = btn.dataset.event || 'Event';
        document.getElementById('eventRegisterLabel').textContent = `Register — ${evName}`;
        document.getElementById('eventNameInput').value = evName;
        bootstrapModal.show();
      });
    });

    const evForm = document.getElementById('eventRegisterForm');
    if(evForm){
      evForm.addEventListener('submit', function(e){
        if(!evForm.checkValidity()){
          e.preventDefault();
          evForm.querySelector(':invalid')?.focus();
          alert('Please fill all required fields.');
        } else {
          e.preventDefault();
          const name = document.getElementById('ev-firstName').value;
          const eventName = document.getElementById('eventNameInput').value;
          alert(`Thanks ${name}! You are registered for ${eventName}.`);
          evForm.reset();
          bootstrapModal.hide();
        }
      });
    }
  }

  // Desktop: add a small JS hover handler with a short hide-delay for reliable open/close
  (function(){
    if(window.matchMedia('(min-width: 992px)').matches){
      const dropdowns = document.querySelectorAll('.navbar .dropdown');
      dropdowns.forEach(drop => {
        let timeoutId = null;
        drop.addEventListener('mouseenter', ()=>{
          clearTimeout(timeoutId);
          drop.classList.add('show');
          const menu = drop.querySelector('.dropdown-menu');
          menu && menu.classList.add('show');
        });
        drop.addEventListener('mouseleave', ()=>{
          // small delay so user can move pointer into menu without it closing instantly
          timeoutId = setTimeout(()=>{
            drop.classList.remove('show');
            const menu = drop.querySelector('.dropdown-menu');
            menu && menu.classList.remove('show');
          }, 120);
        });
      });

      // Close any open dropdowns when clicking other top-level nav links
      function closeAllDropdowns(){
        document.querySelectorAll('.navbar .dropdown.show').forEach(d=>{
          d.classList.remove('show');
          const m = d.querySelector('.dropdown-menu'); m && m.classList.remove('show');
        });
      }
      document.querySelectorAll('.navbar .nav-link').forEach(link=>{
        link.addEventListener('click', (e)=>{
          // if clicking a link that is not the dropdown toggle, close open dropdowns
          if(!link.classList.contains('dropdown-toggle')) closeAllDropdowns();
        });
      });
    }
  })();
});
