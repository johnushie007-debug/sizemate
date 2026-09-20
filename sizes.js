/* =====================================================================
   SizeMate — the conversion tables
   =====================================================================
   Every conversion in the app comes from this file. Each category has
   rows, and each row is one size expressed in every system at once. To
   correct or extend the app, edit a row here: nothing else changes.

   HONEST NOTE, SHOWN IN THE APP TOO
   These are the standard conversion charts. Real garments vary by brand
   and by country of manufacture, and Chinese sizing in particular runs
   smaller than Western sizing. Body measurements in centimetres are the
   only truly reliable guide, which is why every row carries them.
   ===================================================================== */

const SIZE_DATA = [
  /* ---------------- WOMEN: tops, dresses, jackets ------------------- */
  {
    id: 'w-tops', gender: 'female', icon: 'dress',
    label: 'Tops, dresses & jackets',
    hint: 'Measure around the fullest part of the bust, keeping the tape level.',
    systems: [
      { key: 'us', label: 'US' }, { key: 'uk', label: 'UK' },
      { key: 'cn', label: 'China' }, { key: 'eu', label: 'EU' },
      { key: 'letter', label: 'S / M / L' }
    ],
    body: [{ key: 'bust', label: 'Bust (cm)' }, { key: 'waist', label: 'Waist (cm)' }],
    rows: [
      { us: '0',  uk: '4',  eu: '32', cn: '155/76A', letter: 'XS',   bust: '78–81',   waist: '60–63' },
      { us: '2',  uk: '6',  eu: '34', cn: '155/80A', letter: 'XS/S', bust: '82–85',   waist: '64–67' },
      { us: '4',  uk: '8',  eu: '36', cn: '160/84A', letter: 'S',    bust: '86–89',   waist: '68–71' },
      { us: '6',  uk: '10', eu: '38', cn: '160/88A', letter: 'M',    bust: '90–93',   waist: '72–75' },
      { us: '8',  uk: '12', eu: '40', cn: '165/92A', letter: 'L',    bust: '94–97',   waist: '76–79' },
      { us: '10', uk: '14', eu: '42', cn: '170/96A', letter: 'XL',   bust: '98–102',  waist: '80–84' },
      { us: '12', uk: '16', eu: '44', cn: '175/100A', letter: 'XXL', bust: '103–107', waist: '85–89' },
      { us: '14', uk: '18', eu: '46', cn: '175/104A', letter: '3XL', bust: '108–112', waist: '90–94' },
      { us: '16', uk: '20', eu: '48', cn: '180/108A', letter: '4XL', bust: '113–117', waist: '95–99' },
      { us: '18', uk: '22', eu: '50', cn: '180/112A', letter: '5XL', bust: '118–122', waist: '100–104' }
    ]
  },

  /* ---------------- WOMEN: trousers, jeans, skirts ------------------ */
  {
    id: 'w-trousers', gender: 'female', icon: 'trousers',
    label: 'Trousers, jeans & skirts',
    hint: 'Measure around the natural waist, and around the fullest part of the hips.',
    systems: [
      { key: 'us', label: 'US' }, { key: 'uk', label: 'UK' },
      { key: 'waistIn', label: 'Waist (inches)' }, { key: 'cn', label: 'China' },
      { key: 'eu', label: 'EU' }
    ],
    body: [{ key: 'waist', label: 'Waist (cm)' }, { key: 'hip', label: 'Hip (cm)' }],
    rows: [
      { us: '0',  uk: '4',  waistIn: '24', eu: '32', cn: '155/60A', waist: '60–62', hip: '84–86' },
      { us: '2',  uk: '6',  waistIn: '25', eu: '34', cn: '155/64A', waist: '63–65', hip: '87–89' },
      { us: '4',  uk: '8',  waistIn: '26', eu: '36', cn: '160/66A', waist: '66–68', hip: '90–92' },
      { us: '6',  uk: '10', waistIn: '27', eu: '38', cn: '160/68A', waist: '69–71', hip: '93–95' },
      { us: '8',  uk: '12', waistIn: '28', eu: '40', cn: '165/70A', waist: '72–74', hip: '96–98' },
      { us: '10', uk: '14', waistIn: '29', eu: '42', cn: '165/74A', waist: '75–77', hip: '99–101' },
      { us: '12', uk: '16', waistIn: '31', eu: '44', cn: '170/78A', waist: '78–81', hip: '102–105' },
      { us: '14', uk: '18', waistIn: '32', eu: '46', cn: '170/82A', waist: '82–85', hip: '106–109' },
      { us: '16', uk: '20', waistIn: '34', eu: '48', cn: '175/86A', waist: '86–89', hip: '110–113' },
      { us: '18', uk: '22', waistIn: '36', eu: '50', cn: '175/90A', waist: '90–94', hip: '114–118' }
    ]
  },

  /* ---------------- WOMEN: shoes ------------------------------------ */
  {
    id: 'w-shoes', gender: 'female', icon: 'shoe',
    label: 'Shoes',
    hint: 'Stand on paper, mark heel and longest toe, measure the gap. Measure both feet in the evening and use the longer one.',
    systems: [
      { key: 'us', label: 'US' }, { key: 'uk', label: 'UK' },
      { key: 'cn', label: 'China' }, { key: 'eu', label: 'EU' }
    ],
    body: [{ key: 'mm', label: 'Foot length (mm)' }],
    rows: [
      { us: '5',    uk: '3',    eu: '35',   cn: '35',   mm: '220' },
      { us: '5.5',  uk: '3.5',  eu: '35.5', cn: '35.5', mm: '223' },
      { us: '6',    uk: '4',    eu: '36',   cn: '36',   mm: '227' },
      { us: '6.5',  uk: '4.5',  eu: '37',   cn: '37',   mm: '231' },
      { us: '7',    uk: '5',    eu: '37.5', cn: '37.5', mm: '235' },
      { us: '7.5',  uk: '5.5',  eu: '38',   cn: '38',   mm: '239' },
      { us: '8',    uk: '6',    eu: '38.5', cn: '39',   mm: '243' },
      { us: '8.5',  uk: '6.5',  eu: '39',   cn: '39.5', mm: '247' },
      { us: '9',    uk: '7',    eu: '40',   cn: '40',   mm: '251' },
      { us: '9.5',  uk: '7.5',  eu: '40.5', cn: '40.5', mm: '255' },
      { us: '10',   uk: '8',    eu: '41',   cn: '41',   mm: '259' },
      { us: '10.5', uk: '8.5',  eu: '42',   cn: '42',   mm: '263' },
      { us: '11',   uk: '9',    eu: '42.5', cn: '42.5', mm: '267' },
      { us: '12',   uk: '10',   eu: '44',   cn: '44',   mm: '275' }
    ]
  },

  /* ---------------- MEN: shirts ------------------------------------- */
  {
    id: 'm-shirts', gender: 'male', icon: 'shirt',
    label: 'Shirts (by collar)',
    hint: 'Measure around the base of the neck where the collar sits, and add a finger’s width.',
    systems: [
      { key: 'us', label: 'US (neck, in)' }, { key: 'uk', label: 'UK (neck, in)' },
      { key: 'cn', label: 'China (neck, cm)' }, { key: 'eu', label: 'EU' },
      { key: 'letter', label: 'S / M / L' }
    ],
    body: [{ key: 'chest', label: 'Chest (cm)' }],
    rows: [
      { us: '14',   uk: '14',   cn: '36', eu: '36', letter: 'XS', chest: '86–89' },
      { us: '14.5', uk: '14.5', cn: '37', eu: '37', letter: 'S',  chest: '90–93' },
      { us: '15',   uk: '15',   cn: '38', eu: '38', letter: 'S/M', chest: '94–97' },
      { us: '15.5', uk: '15.5', cn: '39', eu: '39', letter: 'M',  chest: '98–101' },
      { us: '16',   uk: '16',   cn: '41', eu: '41', letter: 'L',  chest: '102–106' },
      { us: '16.5', uk: '16.5', cn: '42', eu: '42', letter: 'L/XL', chest: '107–111' },
      { us: '17',   uk: '17',   cn: '43', eu: '43', letter: 'XL', chest: '112–116' },
      { us: '17.5', uk: '17.5', cn: '44', eu: '44', letter: 'XXL', chest: '117–121' },
      { us: '18',   uk: '18',   cn: '46', eu: '46', letter: '3XL', chest: '122–127' }
    ]
  },

  /* ---------------- MEN: suits, jackets, coats ---------------------- */
  {
    id: 'm-jackets', gender: 'male', icon: 'jacket',
    label: 'Suits, jackets & coats',
    hint: 'Measure around the fullest part of the chest, under the arms, with arms relaxed.',
    systems: [
      { key: 'us', label: 'US (chest, in)' }, { key: 'uk', label: 'UK (chest, in)' },
      { key: 'cn', label: 'China' }, { key: 'eu', label: 'EU' },
      { key: 'letter', label: 'S / M / L' }
    ],
    body: [{ key: 'chest', label: 'Chest (cm)' }, { key: 'waist', label: 'Waist (cm)' }],
    rows: [
      { us: '34', uk: '34', eu: '44', cn: '165/84A',  letter: 'XS',  chest: '86–89',   waist: '74–77' },
      { us: '36', uk: '36', eu: '46', cn: '170/88A',  letter: 'S',   chest: '90–93',   waist: '78–81' },
      { us: '38', uk: '38', eu: '48', cn: '175/92A',  letter: 'M',   chest: '94–98',   waist: '82–85' },
      { us: '40', uk: '40', eu: '50', cn: '180/96A',  letter: 'L',   chest: '99–103',  waist: '86–90' },
      { us: '42', uk: '42', eu: '52', cn: '180/100A', letter: 'XL',  chest: '104–108', waist: '91–95' },
      { us: '44', uk: '44', eu: '54', cn: '185/104A', letter: 'XXL', chest: '109–113', waist: '96–100' },
      { us: '46', uk: '46', eu: '56', cn: '185/108A', letter: '3XL', chest: '114–118', waist: '101–106' },
      { us: '48', uk: '48', eu: '58', cn: '190/112A', letter: '4XL', chest: '119–124', waist: '107–112' }
    ]
  },

  /* ---------------- MEN: trousers ----------------------------------- */
  {
    id: 'm-trousers', gender: 'male', icon: 'trousers',
    label: 'Trousers & jeans',
    hint: 'Measure around the waist where the trousers sit, not over a belt.',
    systems: [
      { key: 'us', label: 'US (waist, in)' }, { key: 'uk', label: 'UK (waist, in)' },
      { key: 'cn', label: 'China' }, { key: 'eu', label: 'EU' },
      { key: 'letter', label: 'S / M / L' }
    ],
    body: [{ key: 'waist', label: 'Waist (cm)' }, { key: 'hip', label: 'Hip (cm)' }],
    rows: [
      { us: '28', uk: '28', eu: '44', cn: '165/72A', letter: 'XS',  waist: '71–73', hip: '88–91' },
      { us: '30', uk: '30', eu: '46', cn: '170/76A', letter: 'S',   waist: '76–78', hip: '92–95' },
      { us: '32', uk: '32', eu: '48', cn: '175/80A', letter: 'M',   waist: '81–83', hip: '96–99' },
      { us: '34', uk: '34', eu: '50', cn: '175/84A', letter: 'L',   waist: '86–88', hip: '100–103' },
      { us: '36', uk: '36', eu: '52', cn: '180/88A', letter: 'XL',  waist: '91–94', hip: '104–107' },
      { us: '38', uk: '38', eu: '54', cn: '180/92A', letter: 'XXL', waist: '96–99', hip: '108–111' },
      { us: '40', uk: '40', eu: '56', cn: '185/96A', letter: '3XL', waist: '101–104', hip: '112–115' },
      { us: '42', uk: '42', eu: '58', cn: '185/100A', letter: '4XL', waist: '106–109', hip: '116–120' }
    ]
  },

  /* ---------------- MEN: shoes -------------------------------------- */
  {
    id: 'm-shoes', gender: 'male', icon: 'shoe',
    label: 'Shoes',
    hint: 'Stand on paper, mark heel and longest toe, measure the gap. Measure both feet in the evening and use the longer one.',
    systems: [
      { key: 'us', label: 'US' }, { key: 'uk', label: 'UK' },
      { key: 'cn', label: 'China' }, { key: 'eu', label: 'EU' }
    ],
    body: [{ key: 'mm', label: 'Foot length (mm)' }],
    rows: [
      { us: '6',    uk: '5.5',  eu: '39',   cn: '39',   mm: '240' },
      { us: '6.5',  uk: '6',    eu: '39.5', cn: '39.5', mm: '244' },
      { us: '7',    uk: '6.5',  eu: '40',   cn: '40',   mm: '248' },
      { us: '7.5',  uk: '7',    eu: '40.5', cn: '40.5', mm: '252' },
      { us: '8',    uk: '7.5',  eu: '41',   cn: '41',   mm: '256' },
      { us: '8.5',  uk: '8',    eu: '42',   cn: '42',   mm: '260' },
      { us: '9',    uk: '8.5',  eu: '42.5', cn: '42.5', mm: '265' },
      { us: '9.5',  uk: '9',    eu: '43',   cn: '43',   mm: '269' },
      { us: '10',   uk: '9.5',  eu: '44',   cn: '44',   mm: '273' },
      { us: '10.5', uk: '10',   eu: '44.5', cn: '44.5', mm: '277' },
      { us: '11',   uk: '10.5', eu: '45',   cn: '45',   mm: '281' },
      { us: '11.5', uk: '11',   eu: '45.5', cn: '45.5', mm: '285' },
      { us: '12',   uk: '11.5', eu: '46',   cn: '46',   mm: '290' },
      { us: '13',   uk: '12.5', eu: '47.5', cn: '47',   mm: '298' }
    ]
  }
];

/* Countries offered on the profile screen. The "system" decides which
   column the app shows first for that user. */
const COUNTRIES = [
  { name: 'Nigeria', system: 'uk' },
  { name: 'United Kingdom', system: 'uk' },
  { name: 'United States', system: 'us' },
  { name: 'China', system: 'cn' },
  { name: 'Ghana', system: 'uk' },
  { name: 'Kenya', system: 'uk' },
  { name: 'South Africa', system: 'uk' },
  { name: 'Canada', system: 'us' },
  { name: 'Germany', system: 'eu' },
  { name: 'France', system: 'eu' },
  { name: 'Italy', system: 'eu' },
  { name: 'United Arab Emirates', system: 'uk' },
  { name: 'India', system: 'uk' },
  { name: 'Other', system: 'us' }
];

if (typeof module !== 'undefined') module.exports = { SIZE_DATA, COUNTRIES };
