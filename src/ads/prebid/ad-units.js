
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
        bidder: 'adtelligent',
        params: {
          placementId: '350975'
        }
      },
      {
        bidder: 'bidmatic',
        params: {
          placement: '886409'
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
          placementId: '350975'
        }
      },
      {
        bidder: 'bidmatic',
        params: {
          placement: '886409'
        }
      }
    ]
  }
];

export const SLOT_DEFS = [
  { adUnitPath: '/123456/slot-top',  sizes: [[728,90],[970,250]],  elementId: 'div-gpt-top'  },
  { adUnitPath: '/123456/slot-side', sizes: [[300,250],[300,600]], elementId: 'div-gpt-side' },
];
