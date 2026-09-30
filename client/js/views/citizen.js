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
      <div class="container" style="max-width: 600px; padding-bottom: 80px;">
        <h2 class="mb-4">Report an Issue</h2>
        
        <!-- Stepper -->
        <div class="flex justify-center gap-2 mb-4">
          <div style="width: 30px; height: 30px; border-radius: 50%; background: ${step >= 1 ? 'var(--color-accent)' : 'var(--color-border)'}; color: white; display: flex; align-items: center; justify-content: center;">1</div>
          <div style="width: 40px; height: 2px; background: ${step >= 2 ? 'var(--color-accent)' : 'var(--color-border)'}; margin-top: 14px;"></div>
          <div style="width: 30px; height: 30px; border-radius: 50%; background: ${step >= 2 ? 'var(--color-accent)' : 'var(--color-border)'}; color: white; display: flex; align-items: center; justify-content: center;">2</div>
          <div style="width: 40px; height: 2px; background: ${step >= 3 ? 'var(--color-accent)' : 'var(--color-border)'}; margin-top: 14px;"></div>
          <div style="width: 30px; height: 30px; border-radius: 50%; background: ${step >= 3 ? 'var(--color-accent)' : 'var(--color-border)'}; color: white; display: flex; align-items: center; justify-content: center;">3</div>
        </div>

        <cc-card id="step-content"></cc-card>
      </div>
      
      <!-- Bottom Nav (stub) -->
      <div style="position: fixed; bottom: 0; width: 100%; background: white; border-top: 1px solid var(--color-border); display: flex; justify-content: space-around; padding: var(--spacing-2);">
        <cc-button variant="ghost" style="flex-direction: column;"><span style="font-size: 24px;">📝</span>Report</cc-button>
        <cc-button variant="ghost" style="flex-direction: column;" onclick="window.location.hash='#/citizen/map'"><span style="font-size: 24px;">🗺️</span>Map</cc-button>
        <cc-button variant="ghost" style="flex-direction: column;" onclick="window.location.hash='#/citizen/history'"><span style="font-size: 24px;">📋</span>History</cc-button>
      </div>
    `;

    const content = container.querySelector('#step-content');

    if (step === 1) {
      content.innerHTML = `
        <h3>Step 1: Photo</h3>
        <p class="mb-4">Take a clear photo of the waste or issue.</p>
        <div style="border: 2px dashed var(--color-border); border-radius: var(--border-radius-md); padding: var(--spacing-6); text-align: center;">
          ${reportData.photoUrl ? `
            <img src="${reportData.photoUrl}" style="max-width: 100%; border-radius: var(--border-radius-sm); margin-bottom: var(--spacing-4);" />
            <div><cc-button id="retake-btn" variant="secondary">Retake Photo</cc-button></div>
          ` : `
            <label for="camera-input" style="cursor: pointer; display: flex; flex-direction: column; align-items: center;">
              <span style="font-size: 48px; margin-bottom: var(--spacing-2);">📷</span>
              <span style="color: var(--color-accent); font-weight: 500;">Tap to open camera</span>
            </label>
            <input type="file" id="camera-input" accept="image/*" capture="environment" style="display: none;" />
          `}
        </div>
        <div class="mt-4 flex" style="justify-content: flex-end;">
          <cc-button id="next-btn" variant="primary" ${!reportData.photoUrl ? 'disabled' : ''}>Next</cc-button>
        </div>
      `;

      if (!reportData.photoUrl) {
        content.querySelector('#camera-input').addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (file) {
            // Client-side compression stub - just creating a blob URL for preview
            reportData.photoUrl = URL.createObjectURL(file);
            // In background, we could send this to /api/complaints/suggest-category
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
        <h3>Step 2: Location</h3>
        <p class="mb-4">Where is this located?</p>
        <cc-input id="address-input" label="Address" placeholder="Enter address or use current location" value="${reportData.address}"></cc-input>
        <div class="mb-4 text-center">
          <cc-button id="locate-btn" variant="secondary">📍 Use My Location</cc-button>
        </div>
        <!-- Google Map stub placeholder -->
        <div style="width: 100%; height: 200px; background: #E5E7EB; border-radius: var(--border-radius-sm); display: flex; align-items: center; justify-content: center;">
          Map Placeholder
        </div>
        <div class="mt-4 flex" style="justify-content: space-between;">
          <cc-button id="prev-btn" variant="secondary">Back</cc-button>
          <cc-button id="next-btn" variant="primary">Next</cc-button>
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
        <h3>Step 3: Category</h3>
        <p class="mb-4">What kind of issue is this?</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-2); margin-bottom: var(--spacing-4);">
          ${['Wet / Organic', 'Dry', 'Overflowing bin', 'Illegal dumping'].map(c => `
            <div class="category-card ${reportData.category === c ? 'selected' : ''}" data-cat="${c}" style="border: 2px solid ${reportData.category === c ? 'var(--color-accent)' : 'var(--color-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-2); text-align: center; cursor: pointer; background: ${reportData.category === c ? 'rgba(22,163,74,0.1)' : 'white'};">
              ${c}
            </div>
          `).join('')}
        </div>

        <cc-input type="textarea" id="desc-input" label="Additional Details (Optional)" placeholder="Any extra information..." value="${reportData.description}"></cc-input>
        
        <div class="mt-4 flex" style="justify-content: space-between;">
          <cc-button id="prev-btn" variant="secondary">Back</cc-button>
          <cc-button id="submit-btn" variant="primary">Submit</cc-button>
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
          
          await request('/complaints', {
            method: 'POST',
            body: JSON.stringify(reportData)
          });
          
          alert('Report submitted successfully!');
          window.location.hash = '#/citizen/history';
        } catch (err) {
          alert('Failed to submit: ' + err.message);
          content.querySelector('#submit-btn').removeAttribute('disabled');
        }
      });
    }
  };

  render();
}
