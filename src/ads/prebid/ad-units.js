const API = import.meta.env?.VITE_BACKEND || "http://localhost:3000";
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
          placementId: '886409',
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
          placementId: '886409',
          endpoint: `${API}/api/balitska/get`,
           adType: "BANNER",
        }
      }
    ]
  }
];

export const SLOT_DEFS = [
  { adUnitPath: '/123456/slot-top',  sizes: [[728,90],[970,250]],  elementId: 'div-gpt-top'  },
  { adUnitPath: '/123456/slot-side', sizes: [[300,250],[300,600]], elementId: 'div-gpt-side' },
];
