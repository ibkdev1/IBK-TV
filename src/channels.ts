export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: string;
  country: string;
  language: string;
  streamUrl: string;
  referer?: string;
}

export function proxyUrl(rawUrl: string, referer?: string): string {
  let url = `/stream?url=${encodeURIComponent(rawUrl)}`;
  if (referer) url += `&referer=${encodeURIComponent(referer)}`;
  return url;
}

export const categories = [
  'All', 'US', 'Mali', "Côte d'Ivoire", 'Niger', 'Sénégal', 'Guinée', 'Morocco', 'France', 'News',
];

export const channels: Channel[] = [

  // ══════════════════════════════════════════════
  //  🇺🇸  UNITED STATES
  // ══════════════════════════════════════════════
  {
    id: 'fox-weather',
    name: 'Fox Weather',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Fox_Weather_logo.svg/120px-Fox_Weather_logo.svg.png',
    streamUrl: 'https://247wlive.foxweather.com/stream/index.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'court-tv',
    name: 'Court TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Court_TV_logo_%282019%29.svg/120px-Court_TV_logo_%282019%29.svg.png',
    streamUrl: 'https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-courttv-tablo/playlist.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'ion-plus',
    name: 'ION Plus',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ION_Plus_logo.svg/120px-ION_Plus_logo.svg.png',
    streamUrl: 'https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-ionplus-tablo/playlist.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'bounce-xl',
    name: 'Bounce TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Bounce_TV_logo.svg/120px-Bounce_TV_logo.svg.png',
    streamUrl: 'https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-bouncexl-tablo/playlist.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'documentary-plus',
    name: 'Documentary+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/60px-NASA_logo.svg.png',
    streamUrl: 'https://1d153317c8db4250b3789601274e2402.mediatailor.us-west-2.amazonaws.com/v1/master/ba62fe743df0fe93366eba3a257d792884136c7f/LINEAR-887-DOCUMENTARYINTERNATIONAL-DOCUMENTARYPLUS/mt/documentaryplus/887/hls/master/playlist.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'bloomberg-us',
    name: 'Bloomberg TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/New_Bloomberg_Logo.svg/120px-New_Bloomberg_Logo.svg.png',
    streamUrl: 'https://bloomberg.com/media-manifest/streams/us.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'pbs-kids',
    name: 'PBS Kids',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PBS_Kids_Logo_2013.svg/120px-PBS_Kids_Logo_2013.svg.png',
    streamUrl: 'https://livestream.pbskids.org/out/v1/14507d931bbe48a69287e4850e53443c/est.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'cspan',
    name: 'C-SPAN',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/C-SPAN_logo.svg/120px-C-SPAN_logo.svg.png',
    streamUrl: 'https://547f72e6652371c3.mediapackage.us-east-1.amazonaws.com/out/v1/e3e6e29095844c4ba7d887f01e44a5ef/index.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'newsy',
    name: 'Newsy',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Newsy_2020_logo.svg/120px-Newsy_2020_logo.svg.png',
    streamUrl: 'https://d1bl6tskrpq9ze.cloudfront.net/hls/master.m3u8?ads.xumo_channelId=99984003',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'nasa-tv',
    name: 'NASA TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/120px-NASA_logo.svg.png',
    streamUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },

  // ══════════════════════════════════════════════
  //  🇲🇱  MALI
  // ══════════════════════════════════════════════
  {
    id: 'ortm1',
    name: 'ORTM 1',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/1/15/ORTM_logo.png/120px-ORTM_logo.png',
    streamUrl: 'http://69.64.57.208/ortm/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'ortm2',
    name: 'ORTM 2',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/1/15/ORTM_logo.png/120px-ORTM_logo.png',
    streamUrl: 'http://69.64.57.208/tm2/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'africable',
    name: 'Africable TV',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/9/9c/Africable_logo.png/120px-Africable_logo.png',
    streamUrl: 'http://69.64.57.208/africable/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'd3tv',
    name: 'D3 TV',
    logo: 'https://yt3.googleusercontent.com/ytc/AIdro_m_dummy/photo.jpg',
    streamUrl: 'https://live20.bozztv.com/akamaissh101/ssh101/d3tvnet/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'nieta-tv',
    name: 'Niéta TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Flag_of_Mali.svg/60px-Flag_of_Mali.svg.png',
    streamUrl: 'http://69.64.57.208/nieta/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  🇨🇮  CÔTE D'IVOIRE
  // ══════════════════════════════════════════════
  {
    id: 'rti1',
    name: 'RTI 1',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/0/02/RTI_1_logo_2014.png/120px-RTI_1_logo_2014.png',
    streamUrl: 'https://video1.getstreamhosting.com:1936/8336/8336/playlist.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },
  {
    id: 'rti2',
    name: 'RTI 2',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/0/02/RTI_1_logo_2014.png/120px-RTI_1_logo_2014.png',
    streamUrl: 'https://video1.getstreamhosting.com:1936/8066/8066/playlist.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },
  {
    id: 'rti-la3',
    name: 'RTI La 3',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/0/02/RTI_1_logo_2014.png/120px-RTI_1_logo_2014.png',
    streamUrl: 'http://69.64.57.208/la3/index.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },
  {
    id: 'nci',
    name: 'NCI',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/2/27/Logo_NCI.png/120px-Logo_NCI.png',
    streamUrl: 'https://video1.getstreamhosting.com:1936/8338/8338/playlist.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },
  {
    id: 'aplus-ivoire',
    name: 'A+ Ivoire',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/60px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png',
    streamUrl: 'http://69.64.57.208/atv/playlist.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },
  {
    id: 'business24',
    name: 'Business 24',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/60px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png',
    streamUrl: 'https://cdn-globecast.akamaized.net/live/eds/business24_tv/hls_video/index.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  🇳🇪  NIGER
  // ══════════════════════════════════════════════
  {
    id: 'telesahel',
    name: 'Télé Sahel',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/3/3f/Logo_Tele_Sahel.png/120px-Logo_Tele_Sahel.png',
    streamUrl: 'https://mediaserver1.castpin.com/hls/telesahel/index.m3u8',
    category: 'Niger',
    country: 'Niger',
    language: 'French',
  },
  {
    id: 'tal-tv',
    name: 'Tal TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Flag_of_Niger.svg/60px-Flag_of_Niger.svg.png',
    streamUrl: 'https://mediaserver1.castpin.com/hls/taltv/index.m3u8',
    category: 'Niger',
    country: 'Niger',
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  🇸🇳  SÉNÉGAL
  // ══════════════════════════════════════════════
  {
    id: 'rts1',
    name: 'RTS 1',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/c/c6/RTS_Logo.png/120px-RTS_Logo.png',
    streamUrl: 'http://69.64.57.208/rts1/playlist.m3u8',
    category: 'Sénégal',
    country: 'Sénégal',
    language: 'French/Wolof',
  },
  {
    id: 'rts2',
    name: 'RTS 2',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/c/c6/RTS_Logo.png/120px-RTS_Logo.png',
    streamUrl: 'http://69.64.57.208/rts2/playlist.m3u8',
    category: 'Sénégal',
    country: 'Sénégal',
    language: 'French/Wolof',
  },
  {
    id: 'tfm',
    name: 'TFM',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/8/82/TFM_logo.png/120px-TFM_logo.png',
    streamUrl: 'http://69.64.57.208/tfm/playlist.m3u8',
    category: 'Sénégal',
    country: 'Sénégal',
    language: 'French/Wolof',
  },
  {
    id: '2stv',
    name: '2STV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Flag_of_Senegal.svg/60px-Flag_of_Senegal.svg.png',
    streamUrl: 'http://69.64.57.208/2stv/playlist.m3u8',
    category: 'Sénégal',
    country: 'Sénégal',
    language: 'French/Wolof',
  },
  {
    id: 'sentv',
    name: 'Sen TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Flag_of_Senegal.svg/60px-Flag_of_Senegal.svg.png',
    streamUrl: 'http://69.64.57.208/sentv/playlist.m3u8',
    category: 'Sénégal',
    country: 'Sénégal',
    language: 'French/Wolof',
  },
  {
    id: 'walf-tv',
    name: 'Walf TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Flag_of_Senegal.svg/60px-Flag_of_Senegal.svg.png',
    streamUrl: 'http://69.64.57.208/walftv/playlist.m3u8',
    category: 'Sénégal',
    country: 'Sénégal',
    language: 'French/Wolof',
  },

  // ══════════════════════════════════════════════
  //  🇬🇳  GUINÉE CONAKRY
  // ══════════════════════════════════════════════
  {
    id: 'rtg1',
    name: 'RTG 1',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_Guinea.svg/60px-Flag_of_Guinea.svg.png',
    streamUrl: 'http://69.64.57.208/rtg/playlist.m3u8',
    category: 'Guinée',
    country: 'Guinée Conakry',
    language: 'French',
  },
  {
    id: 'espace-tv',
    name: 'Espace TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_Guinea.svg/60px-Flag_of_Guinea.svg.png',
    streamUrl: 'https://edge11.vedge.infomaniak.com/livecast/ik:espacetv/manifest.m3u8',
    category: 'Guinée',
    country: 'Guinée Conakry',
    language: 'French',
  },
  {
    id: 'kalac-tv',
    name: 'Kalac TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_Guinea.svg/60px-Flag_of_Guinea.svg.png',
    streamUrl: 'https://edge13.vedge.infomaniak.com/livecast/ik:kalactv/manifest.m3u8',
    category: 'Guinée',
    country: 'Guinée Conakry',
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  🇲🇦  MAROC
  // ══════════════════════════════════════════════
  {
    id: 'al-aoula',
    name: 'Al Aoula',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Al_Aoula_logo.svg/120px-Al_Aoula_logo.svg.png',
    streamUrl: 'https://stream-lb.livemedia.ma/alaoula/hls/master.m3u8',
    referer: 'https://snrtlive.ma/',
    category: 'Morocco',
    country: 'Maroc',
    language: 'Arabic/French',
  },
  {
    id: '2m-maroc',
    name: '2M Maroc',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/2M_Maroc_Logo.svg/120px-2M_Maroc_Logo.svg.png',
    streamUrl: 'https://d2qh3gh0k5vp3v.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-n6pess5lwbghr/2M_ES.m3u8',
    category: 'Morocco',
    country: 'Maroc',
    language: 'Arabic/French',
  },
  {
    id: 'arryadia',
    name: 'Arryadia Sport',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Arryadia_Logo.svg/120px-Arryadia_Logo.svg.png',
    streamUrl: 'https://stream-lb.livemedia.ma/arryadia/hls/master.m3u8',
    referer: 'https://snrtlive.ma/',
    category: 'Morocco',
    country: 'Maroc',
    language: 'Arabic',
  },
  {
    id: 'al-maghribia',
    name: 'Al Maghribia',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Logo_AlMaghribia.svg/120px-Logo_AlMaghribia.svg.png',
    streamUrl: 'https://stream-lb.livemedia.ma/almaghribia/hls/master.m3u8',
    referer: 'https://snrtlive.ma/',
    category: 'Morocco',
    country: 'Maroc',
    language: 'Arabic',
  },

  // ══════════════════════════════════════════════
  //  🇫🇷  FRANCE
  // ══════════════════════════════════════════════
  {
    id: 'bfm-tv',
    name: 'BFM TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/BFM_TV_logo_2017.svg/120px-BFM_TV_logo_2017.svg.png',
    streamUrl: 'https://d1ib1gsg71oarf.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-scp7wda722jph/BFM2_FR.m3u8',
    category: 'France',
    country: 'France',
    language: 'French',
  },
  {
    id: 'france2',
    name: 'France 2',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/France_2_logo_2008.svg/120px-France_2_logo_2008.svg.png',
    streamUrl: 'http://69.64.57.208/france2/mono.m3u8',
    category: 'France',
    country: 'France',
    language: 'French',
  },
  {
    id: 'euronews-fr',
    name: 'Euronews FR',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Euronews_logo_2022.svg/120px-Euronews_logo_2022.svg.png',
    streamUrl: 'https://2f6c5bf4.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmxheHhUVi1ldV9FdXJvbmV3c0ZyYW5jYWlzX0hMUw/playlist.m3u8',
    category: 'France',
    country: 'France/Europe',
    language: 'French',
  },
  {
    id: 'tv5monde',
    name: 'TV5 Monde',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/TV5MONDE_logo_2019.svg/120px-TV5MONDE_logo_2019.svg.png',
    streamUrl: 'https://liveh12.vtvprime.vn/hls/TV5/03.m3u8',
    category: 'France',
    country: 'France / Afrique',
    language: 'French',
  },
  {
    id: 'france24-en',
    name: 'France 24',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/France_24_logo_%282011%29.svg/120px-France_24_logo_%282011%29.svg.png',
    streamUrl: 'https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_2300.m3u8',
    category: 'France',
    country: 'France',
    language: 'English',
  },

  // ══════════════════════════════════════════════
  //  📰  NEWS & INTERNATIONAL
  // ══════════════════════════════════════════════
  {
    id: 'dw-en',
    name: 'DW News',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_symbol_2012.svg/120px-Deutsche_Welle_symbol_2012.svg.png',
    streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    category: 'News',
    country: 'Germany',
    language: 'English',
  },
  {
    id: 'trt-world',
    name: 'TRT World',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/TRT_World_logo.svg/120px-TRT_World_logo.svg.png',
    streamUrl: 'https://tv-trtworld.medya.trt.com.tr/master.m3u8',
    category: 'News',
    country: 'Turkey',
    language: 'English',
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera English',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Al_Jazeera_Logo.svg/120px-Al_Jazeera_Logo.svg.png',
    streamUrl: 'https://live-hls-apps-aje.getaj.net/AJE/index.m3u8',
    category: 'News',
    country: 'International',
    language: 'English',
  },
  {
    id: 'africa24-fr',
    name: 'Africa24 FR',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/1/1e/Africa_24_Logo.svg/120px-Africa_24_Logo.svg.png',
    streamUrl: 'https://africa24.vedge.infomaniak.com/livecast/ik:africa24/manifest.m3u8',
    category: 'News',
    country: 'Afrique',
    language: 'French',
  },
  {
    id: 'africa24-en',
    name: 'Africa24 EN',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/1/1e/Africa_24_Logo.svg/120px-Africa_24_Logo.svg.png',
    streamUrl: 'https://edge20.vedge.infomaniak.com/livecast/ik:africa24english/manifest.m3u8',
    category: 'News',
    country: 'Afrique',
    language: 'English',
  },
];
