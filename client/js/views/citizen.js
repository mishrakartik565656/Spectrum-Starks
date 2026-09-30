import { request } from '../api.js';

export function loadCitizenReportView(container) {
  let step = 1;
  let reportData = {
    photoUrl: null,
    location: null, // { lat, lng }
    address: '',
    category: '',
    description: '',
    severity: 'medium'
  };

  const render = () => {
    container.innerHTML = `
      <div class="report-waste-page fade-in" style="max-width: 600px; margin: 0 auto; padding-bottom: 2rem;">
        <!-- Stepper -->
        <div class="stepper-container mb-4">
          <div class="step ${step >= 1 ? 'active' : ''}">
            <div class="step-circle">1</div>
            <span>Photo</span>
          </div>
          <div class="step-line ${step >= 2 ? 'active' : ''}"></div>
          <div class="step ${step >= 2 ? 'active' : ''}">
            <div class="step-circle">2</div>
            <span>Location</span>
          </div>
          <div class="step-line ${step >= 3 ? 'active' : ''}"></div>
          <div class="step ${step >= 3 ? 'active' : ''}">
            <div class="step-circle">3</div>
            <span>Details</span>
          </div>
        </div>

        <div class="card" style="padding: var(--spacing-6); background: white; border-radius: var(--border-radius-md); box-shadow: var(--shadow-sm);" id="step-content"></div>
      </div>
    `;

    const content = container.querySelector('#step-content');

    if (step === 1) {
      content.innerHTML = `
        <h3 class="mb-2">Step 1: Photo</h3>
        <p class="text-secondary mb-4">Take a clear photo of the waste or issue.</p>
        <div class="photo-upload-area" style="border: 2px dashed var(--color-border); border-radius: var(--border-radius-md); padding: var(--spacing-6); text-align: center; transition: all var(--transition-fast);">
          ${reportData.photoUrl ? `
            <div style="position: relative; display: inline-block;">
              <img src="${reportData.photoUrl}" style="max-width: 100%; max-height: 300px; border-radius: var(--border-radius-sm); margin-bottom: var(--spacing-4); box-shadow: var(--shadow-sm);" />
            </div>
            <div><button id="retake-btn" class="btn btn-secondary"><span class="material-symbols-outlined mr-2">cameraswitch</span> Retake Photo</button></div>
          ` : `
            <label for="camera-input" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; padding: 2rem 0;">
              <div class="icon-circle" style="width: 80px; height: 80px; border-radius: 50%; background: rgba(22, 163, 74, 0.1); color: var(--color-accent); display: flex; align-items: center; justify-content: center; margin-bottom: var(--spacing-4);">
                <span class="material-symbols-outlined" style="font-size: 40px;">photo_camera</span>
              </div>
              <span style="font-weight: 500; font-size: 1.1rem; color: var(--color-text-primary);">Tap to open camera</span>
              <span class="text-secondary mt-2" style="font-size: 0.9rem;">or select from gallery</span>
            </label>
            <input type="file" id="camera-input" accept="image/*" capture="environment" style="display: none;" />
          `}
        </div>
        <div class="mt-4 flex" style="justify-content: flex-end;">
          <button id="next-btn" class="btn btn-primary" ${!reportData.photoUrl ? 'disabled' : ''}>Next <span class="material-symbols-outlined ml-2">arrow_forward</span></button>
        </div>
      `;

      if (!reportData.photoUrl) {
        content.querySelector('#camera-input').addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (file) {
            reportData.photoUrl = URL.createObjectURL(file);
            render();
          }
        });
      } else {
        content.querySelector('#retake-btn').addEventListener('click', () => {
          reportData.photoUrl = null;
          render();
        });
      }

      content.querySelector('#next-btn').addEventListener('click', () => {
        step = 2;
        render();
      });
    } 
    else if (step === 2) {
      content.innerHTML = `
        <h3 class="mb-2">Step 2: Location</h3>
        <p class="text-secondary mb-4">Where is this located?</p>
        
        <div class="mb-4">
          <cc-input id="address-input" label="Address" placeholder="Enter address or use current location" value="${reportData.address}"></cc-input>
        </div>
        
        <div class="mb-4">
          <button id="locate-btn" class="btn btn-secondary" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 8px;">
            <span class="material-symbols-outlined">my_location</span> Use My Current Location
          </button>
        </div>
        
        <!-- Map stub placeholder -->
        <div style="width: 100%; height: 200px; background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--border-radius-sm); display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--color-text-secondary);">
          <span class="material-symbols-outlined mb-2" style="font-size: 32px; opacity: 0.5;">map</span>
          Map Preview
        </div>
        
        <div class="mt-6 flex" style="justify-content: space-between;">
          <button id="prev-btn" class="btn btn-secondary"><span class="material-symbols-outlined mr-2">arrow_back</span> Back</button>
          <button id="next-btn" class="btn btn-primary">Next <span class="material-symbols-outlined ml-2">arrow_forward</span></button>
        </div>
      `;

      content.querySelector('#address-input').addEventListener('cc-input', (e) => {
        reportData.address = e.detail;
      });

      content.querySelector('#locate-btn').addEventListener('click', () => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition((pos) => {
            reportData.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            reportData.address = 'Current Location (Lat: ' + pos.coords.latitude.toFixed(4) + ', Lng: ' + pos.coords.longitude.toFixed(4) + ')';
            render();
          }, (err) => alert('Location permission denied.'));
        }
      });

      content.querySelector('#prev-btn').addEventListener('click', () => { step = 1; render(); });
      content.querySelector('#next-btn').addEventListener('click', () => { step = 3; render(); });
    }
    else if (step === 3) {
      content.innerHTML = `
        <h3 class="mb-2">Step 3: Category & Details</h3>
        <p class="text-secondary mb-4">What kind of issue is this?</p>
        
        <div class="category-grid mb-4" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-3);">
          ${['Wet / Organic', 'Dry', 'Overflowing bin', 'Illegal dumping'].map(c => `
            <div class="category-card ${reportData.category === c ? 'selected' : ''}" data-cat="${c}">
              <div class="category-icon">
                <span class="material-symbols-outlined">${c.includes('Wet') ? 'compost' : c.includes('Dry') ? 'recycling' : c.includes('bin') ? 'delete' : 'warning'}</span>
              </div>
              <span>${c}</span>
            </div>
          `).join('')}
        </div>

        <cc-input type="textarea" id="desc-input" label="Additional Details (Optional)" placeholder="Any extra information..." value="${reportData.description}"></cc-input>
        
        <div class="mt-6 flex" style="justify-content: space-between;">
          <button id="prev-btn" class="btn btn-secondary"><span class="material-symbols-outlined mr-2">arrow_back</span> Back</button>
          <button id="submit-btn" class="btn btn-primary" ${!reportData.category ? 'disabled' : ''}>
            <span class="material-symbols-outlined mr-2">send</span> Submit Report
          </button>
        </div>
      `;

      content.querySelectorAll('.category-card').forEach(el => {
        el.addEventListener('click', () => {
          reportData.category = el.dataset.cat;
          render();
        });
      });

      content.querySelector('#desc-input').addEventListener('cc-input', (e) => {
        reportData.description = e.detail;
      });

      content.querySelector('#prev-btn').addEventListener('click', () => { step = 2; render(); });
      content.querySelector('#submit-btn').addEventListener('click', async () => {
        try {
          const btn = content.querySelector('#submit-btn');
          btn.setAttribute('disabled', 'disabled');
          btn.innerHTML = '<span class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></span> Submitting...';
          
          await request('/complaints', {
            method: 'POST',
            body: JSON.stringify(reportData)
          });
          
          alert('Report submitted successfully!');
          window.location.hash = '#/reports';
        } catch (err) {
          alert('Failed to submit: ' + err.message);
          const btn = content.querySelector('#submit-btn');
          btn.removeAttribute('disabled');
          btn.innerHTML = '<span class="material-symbols-outlined mr-2">send</span> Submit Report';
        }
      });
    }
  };

  render();
}
