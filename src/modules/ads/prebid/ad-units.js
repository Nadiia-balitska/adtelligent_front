const API = import.meta.env.VITE_BACKEND;

export const AD_UNITS = [
  {
    code: 'div-gpt-bottom',
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
          // adType: "BANNER",
          // placementId: 'div-gpt-top',

        }
      }
    ]
  },
  {
    code: 'ad-slot',
    mediaTypes: {
      banner: {
        sizes: [[300, 250], [300, 600]]
      }
    },
    bids: [
   
      {
        bidder: 'adtelligent',
        params: {
          aid: '350975',
        
        }
      }
    ]
  },
  {
    code: 'ad-slot-2',
    mediaTypes: {
      banner: {
        sizes: [[300, 250], [300, 600]]
      }
    },
    bids: [
   {
     bidder: 'bidmatic',
     params: {
       source: 886409
     }
   }
    ]
  }
];

export const SLOT_DEFS = [
  { adUnitPath: 'ad-slot',  sizes: [[300, 250], [300, 600]],  elementId: 'ad-slot'  },
  { adUnitPath: 'ad-slot-2',  sizes: [[300, 250], [300, 600]],  elementId: 'ad-slot-2'  },
  { adUnitPath: 'div-gpt-bottom', sizes: [[300,250],[300,600]], elementId: 'div-gpt-bottom' },
];
