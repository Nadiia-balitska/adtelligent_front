const API = import.meta.env?.VITE_BACKEND
export const AD_UNITS = [
  {
    code: 'div-gpt-top',
    mediaTypes: {
      banner: {
        sizes: [[300, 250], [400, 250]]
      }
    },
    bids: [
      {
        bidder: 'balitska',
        params: {
          endpoint: `${API}/balitska/get`,
           adType: "BANNER",
          placementId: 'top-banner',
        }
      }
    ]
  },
  {
    code: 'div-gpt-side',
    mediaTypes: {
      banner: {
        sizes: [[300, 250], [300, 600]]
      }
    },
    bids: [
   
      {
        bidder: 'adtelligent',
        params: {
          endpoint: `${API}/balitska/get`,
          adType: "BANNER",
          placementId: 'side-banner',
        }
      }
    ]
  }
];

export const SLOT_DEFS = [
  { adUnitPath: '/creatives/1759811896894-mastercard.png',  sizes: [[728,90],[970,250]],  elementId: 'div-gpt-top'  },
  { adUnitPath: '/creatives/1759810655931-hero_bg_desc.jpg', sizes: [[300,250],[300,600]], elementId: 'div-gpt-side' },
];
