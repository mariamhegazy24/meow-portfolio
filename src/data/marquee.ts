import type {MarqueeTile} from '../types';

const tile = (face: string, label: string, background: string): MarqueeTile => ({face, label, background});

export const marqueeTiles: MarqueeTile[] = [
  tile('happy', 'NAP MODE', '#F5C6A5'), tile('angry', 'JUDGING YOU', '#EFA6B7'),
  tile('stars', 'TREAT RADAR', '#F8DCE2'), tile('yawn', '3 AM ZOOMIES', '#E99A55'),
  tile('cheeky', 'NO REGRETS', '#F5C6A5'), tile('closed', 'DO NOT DISTURB', '#F8DCE2'),
  tile('up', 'BIRD WATCH', '#EFA6B7'), tile('puff', 'SNACK BREAK', '#F5C6A5'),
  tile('hearts', 'TREAT LOVE', '#F8DCE2'), tile('shock', 'TABLE EDGE', '#E99A55'),
  tile('winkr', 'FLIRTING', '#EFA6B7'), tile('laugh', 'LAUGHING AT YOU', '#F5C6A5'),
  tile('kiss', 'AIR KISS', '#F8DCE2'), tile('dizzy', 'ZOOMIES', '#E99A55'),
  tile('cry', 'NO TREATS', '#EFA6B7'), tile('scared', 'CUCUMBER', '#F5C6A5'),
  tile('half', 'LOADING NAP', '#F8DCE2'), tile('down', 'FLOOR VIEW', '#E99A55'),
  tile('tongue', 'BLEP', '#EFA6B7'), tile('sneeze', 'ACHOO', '#F5C6A5'),
  tile('right', 'SIDE EYE', '#F8DCE2'),
  tile('rest', 'THE MAIN CHARACTER', '#EFA6B7'), tile('left', 'LEFT EYE ON YOU', '#F5C6A5'),
  tile('winkl', 'JUST KIDDING', '#E99A55'), tile('ouch', 'OUCH', '#F8DCE2'),
  tile('shock2', 'WHAT?!', '#EFA6B7'),
];

export const marqueeWords = [
  'MEOW POWER', 'NAP MODE', 'NO HUMAN CONTROL', 'PURRFECTION',
  'CAT ENERGY', 'PROFESSIONAL CHAOS', 'THE MAIN CHARACTER',
];
