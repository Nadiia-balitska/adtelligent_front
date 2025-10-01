const API = import.meta.env?.VITE_BACKEND
export const AD_UNITS = [
  {
    code: 'div-gpt-top',
    mediaTypes: {
      banner: {
        sizes: [[728, 90], [970, 250]]
      }
    },
    bids: [
      {
        bidder: 'balitska',
        params: {
          endpoint: `${API}/api/balitska/get`,
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
        bidder: 'balitska',
        params: {
          endpoint: `${API}/api/balitska/get`,
          adType: "BANNER",
          placementId: 'side-banner',
        }
      }
    ]
  }
];

export const SLOT_DEFS = [
  { adUnitPath: '/123456/slot-top',  sizes: [[728,90],[970,250]],  elementId: 'div-gpt-top'  },
  { adUnitPath: '/123456/slot-side', sizes: [[300,250],[300,600]], elementId: 'div-gpt-side' },
];
