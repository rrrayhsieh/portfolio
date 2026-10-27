/* Where the contact form sends its answers.
   null: the form opens the visitor's email app with everything filled in.
   To send straight into a Google Form instead (README, "Connecting the Google Form"):
   window.FORM_CONFIG = {
     action: 'https://docs.google.com/forms/d/e/<form id>/formResponse',
     fields: { name: 'entry.111', email: 'entry.222', org: 'entry.333', type: 'entry.444',
               need: 'entry.555', budget: 'entry.666', when: 'entry.777' }
   };
   The choices in the Google Form must read exactly as the values in contact.html (品牌影片, NT$3 萬以下, 一個月內 ...). */
window.FORM_CONFIG = null;
