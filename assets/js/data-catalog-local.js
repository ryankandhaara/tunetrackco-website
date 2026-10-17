// ### title = nama / judul produk
// ### artist = nama artis / band / creator
// ### price = harga produk
// ### category = kategori produk
// ### image = thumbnail / cover produk
// ### link = halaman produk
// ### drive-link = link download Google Drive
// ### gumroadLink = link checkout / delivery Gumroad
// ### youtube = link preview YouTube
// ### exclusive = status produk exclusive
// ### exclusivePage = halaman khusus exclusive

const products = [
    {
    "title": "Hark (Israel & New Breed)",
    "artist": "Israel & New Breed",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/002_Yesus-Raja-JPCC.jpg",
    "link": "exclusive.html",
    "gumroadLink": "",
    "youtube": "",
    "exclusive": true,
  },
  {
    "title": "Yesus Raja (JPCC)",
    "artist": "JPCC Worship",
    "price": "IDR 120.000",
    "category": [
      "worship"
    ],
    "image": "assets/thumbnail/002_Yesus-Raja-JPCC.jpg",
    "link": "exclusive.html",
    "gumroadLink": "",
    "youtube": "",
    "exclusive": false,
  },
  {
    "title": "HIS LIFE Christmas Medley",
    "artist": "His Life TV",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/003_HIS-LIFE-Christmas-Medley.jpg",
    "link": "exclusive.html",
    "gumroadLink": "",
    "youtube": "",
    "exclusive": true,
  },
  {
    "title": "Sambutlah Dia",
    "artist": "Symphony Worship Family",
    "price": "Free",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/004_Sambutlah-Dia.jpg",
    "link": "exclusive.html",
    "drive-link": "https://drive.google.com/drive/folders/1WRnCDXTGLgqV7xiuiHWy7AYpUxa_Uoje?usp=sharing",
    "gumroadLink": "",
    "youtube": "",
    "exclusive": true,
  },
  {
    "title": "NOEL med. Gloria",
    "artist": "Various Artist",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/005_NOEL-med-Gloria.jpg",
    "link": "exclusive.html",
    "gumroadLink": "",
    "youtube": "",
    "exclusive": true,
  },
  {
    "title": "Allah Sanggup (GKDI Concert)",
    "artist": "GKDI Official",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/006_Allah-Sanggup-GKDI-Concert.jpg",
    "link": "exclusive.html",
    "gumroadLink": "",
    "youtube": "",
    "exclusive": false,
  },
  {
    "title": "Fajar Terangi Dunia",
    "artist": "Steve Tabalujan & Friends",
    "price": "IDR 120.000",
    "category": [
      "worship"
    ],
    "image": "assets/thumbnail/fajar terangi dunia.jpg",
    "link": "http://lynk.id/gudangsequencer/43dpxgq5g8ox",
    "gumroadLink": "",
    "youtube": "8VMIEMFqCbk",
    "imageCredit": "Assets of Steve Tabalujan & Friends",
    "exclusive": false,
  },
  {
    "title": "Yang Terutama",
    "artist": "Symphony Worship ft. Monita Tahalea",
    "price": "Free",
    "category": [
      "worship",
      "freebies"
    ],
    "image": "assets/thumbnail/008_Yang-Terutama.jpg",
    "link": "pg-yangterutamasw2.html",
    "drive-link": "https://drive.google.com/file/d/12kmrwTuePHOh-13MzUhl7U0zzX_mZFpK/view?usp=sharing",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/gfawvf",
    "youtube": "",
    "imageCredit": "Assets of Symphony Worship",
    "exclusive": false
  },
  {
    "title": "Turn it Up",
    "artist": "Planetshakers",
    "price": "Free",
    "category": [
      "praise",
      "freebies"
    ],
    "image": "assets/thumbnail/planetshaker.jpg",
    "link": "https://lynk.id/gudangsequencer/kld9dpk4gp79",
    "drive-link": "",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/cimabz?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=AX_9JU4VEY8",
    "exclusive": false
  },
  {
    "title": "Puji dia Yesus Sukacitaku",
    "artist": "Symphony Worship",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/010_Puji-dia-Yesus-Sukacitaku.jpg",
    "link": "https://lynk.id/gudangsequencer/4vrx9x4v1lv9",
    "gumroadLink": "",
    "youtube": "",
    "exclusive": false
  },
  {
    "title": "Penulis Hidupku",
    "artist": "NDC Worship",
    "price": "Free",
    "category": [
      "praise",
      "freebies"
    ],
    "image": "assets/thumbnail/penulis hidupku.jpg",
    "link": "pg-penulishidupku.html",
    "drive-link": "https://drive.google.com/drive/folders/1q3H1uXiuOtKeuwbocQmxMQgAmCxHHamT?usp=drive_link",
    "gumroadLink": "",
    "youtube": "",
    "exclusive": false
  },
  {
    "title": "This is Living 2025",
    "artist": "Young & Free",
    "price": "120.000",
    "category": [
      "praise",
      "freebies"
    ],
    "image": "assets/thumbnail/this is living.jpg",
    "link": "https://lynk.id/gudangsequencer/zy845zp59d8g",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/hobrba?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=vWOt21Gbjkk",
    "exclusive": false
  },
  {
    "title": "Yesus Kumenyembahmu",
    "artist": "Symphony Worship",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/013_Yesus-Kumenyembahmu.jpg",
    "link": "https://lynk.id/gudangsequencer/43dpxgq5g8ox",
    "gumroadLink": "",
    "youtube": "https://www.youtube.com/watch?v=B21Vo4dePno",
    "exclusive": false
  },
  {
    "title": "Nothing Is Impossible",
    "artist": "Planetshakers",
    "price": "Free",
    "category": [
      "praise",
      "freebies"
    ],
    "image": "assets/thumbnail/nothing is impossible.jpg",
    "link": "https://lynk.id/gudangsequencer/k2l48wg2317o",
    "drive-link": "https://drive.google.com/drive/folders/1ufnKO_gVuPSWrkwmFJQtUtFYiNCa1uRR?usp=sharing",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/hochpv?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=uRvnYO50Dg8",
    "exclusive": false
  },
  {
    "title": "Lebih dari Pemenang 2026",
    "artist": "Symphony Worship",
    "price": "IDR 120.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/015_Lebih-dari-Pemenang-2026.jpg",
    "link": "https://lynk.id/gudangsequencer/8dv8w2kyl3kd",
    "gumroadLink": "",
    "youtube": "https://www.youtube.com/watch?v=9rxBhGfH_ss",
    "imageCredit": "Assets of Symphony Worship",
    "exclusive": false
  },
  {
    "title": "Allah Sanggup",
    "artist": "Symphony Worship",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/016_Allah-Sanggup.jpg",
    "link": "https://lynk.id/gudangsequencer/w08zo73m7y7z",
    "gumroadLink": "",
    "youtube": "https://www.youtube.com/watch?v=anrvF7cCHrI",
    "exclusive": false
  },
  {
    "title": "Sperti Bapa Sayang Anaknya",
    "artist": "UNDVD",
    "price": "IDR 120.000",
    "category": [
      "worship"
    ],
    "image": "assets/thumbnail/017_Sperti-Bapa-Sayang-Anaknya.jpg",
    "link": "https://lynk.id/gudangsequencer/olm3qd20r82y",
    "gumroadLink": "",
    "youtube": "https://www.youtube.com/watch?v=uEVEO4Nu5iU",
    "exclusive": false
  },
  {
    "title": "Mari Menari 2.0",
    "artist": "UNDVD",
    "price": "IDR 120.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/018_Mari-Menari-2-0.jpg",
    "link": "https://lynk.id/gudangsequencer/gw6onoo5meng",
    "gumroadLink": "",
    "youtube": "https://www.youtube.com/watch?v=-hl-HCpqr3I",
    "exclusive": false
  },
  {
    "title": "Api Pantekosta Medley",
    "artist": "IGNITER Worship",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/019_Api-Pantekosta-Medley.jpg",
    "link": "https://lynk.id/gudangsequencer/m07l2dmr83n6",
    "gumroadLink": "",
    "youtube": "https://www.youtube.com/watch?v=NzUfqjbt-m0",
    "exclusive": false
  },
  {
    "title": "Kecaplah dan Lihatlah",
    "artist": "UNDVD",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/020_Kecaplah-dan-Lihatlah.jpg",
    "link": "https://lynk.id/gudangsequencer/e5ke29g86jxd",
    "gumroadLink": "",
    "youtube": "https://www.youtube.com/watch?v=t3QKjMOMAas",
    "exclusive": false
  },
  {
    "title": "Bukti Kasihmu",
    "artist": "UNDVD ft. NDC Worship",
    "price": "Free",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/021_Bukti-Kasihmu.jpg",
    "link": "https://lynk.id/gudangsequencer/49zn00oe0207",
    "drive-link": "https://drive.google.com/file/d/1Q4p-9VfgQw2az6CdAQTLppUcrX_sSUQM/view?usp=drive_link",
    "gumroadLink": "",
    "youtube": "https://www.youtube.com/watch?v=6zy1qXeNXSc",
    "exclusive": false
  },
  {
    "title": "Trima kasih Tuhan",
    "artist": "Symphony Worship Family",
    "price": "Free",
    "category": [
      "worship",
      "freebies"
    ],
    "image": "assets/thumbnail/022_Trima-kasih-Tuhan.jpg",
    "link": "https://lynk.id/gudangsequencer/okx7yo67kwjo",
    "drive-link": "https://drive.google.com/file/d/1_MYpvLGGDpe_dCeYfz7Yv3sDuwTifT3R/view?usp=drive_link",
    "gumroadLink": "",
    "youtube": "https://www.youtube.com/watch?v=T97RUz3B_FM",
    "exclusive": false
  },
  {
    "title": "Tiap Langkahku",
    "artist": "Gospel Project",
    "price": "Free",
    "category": [
      "freebies",
      "rearrangement"
    ],
    "image": "assets/thumbnail/023_Tiap-Langkahku.jpg",
    "link": "https://lynk.id/gudangsequencer/210x2gjnokle",
    "drive-link": "https://drive.google.com/drive/folders/1DQMR3TLyBtzvIG8LDaQJ1dRueUYdWIft?usp=drive_link",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/nhtznz?wanted=true",
    "youtube": "",
    "exclusive": false
  },
  {
    "title": "Allah sumber Kuatku",
    "artist": "Gospel Project",
    "price": "IDR 100.000",
    "category": [
      "rearrangement"
    ],
    "image": "assets/thumbnail/allah kita heran dan besar gospel project.jpg",
    "link": "https://lynk.id/gudangsequencer/3v9kv95403qo",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/tqavjz?wanted=true",
    "youtube": "",
    "exclusive": false
  },
  {
    "title": "Allah kita heran dan Besar",
    "artist": "Gospel Project",
    "price": "Free",
    "category": [
      "rearrangement"
    ],
    "image": "assets/thumbnail/allah sumber kuatku gospel project.jpg",
    "link": "https://lynk.id/gudangsequencer/jn0p6yd769rm",
    "drive-link": "https://drive.google.com/drive/folders/1BMc-zdTSDE4MsSGHsKXq9I52x5ilHQEo?usp=drive_link",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/xjueub?wanted=true",
    "youtube": "",
    "exclusive": false
  },
  {
    "title": "Friend of God (Arr)",
    "artist": "TMRC",
    "price": "IDR 150.000",
    "category": [
      "rearrangement"
    ],
    "image": "assets/thumbnail/026_Friend-of-God-Arr.jpg",
    "link": "https://lynk.id/gudangsequencer/oykp3mvv9mwd",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/yestik?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=_4fPtZ1SMhI",
    "exclusive": false
  },
  {
    "title": "O Come All ye Faithful",
    "artist": "Planetshaker",
    "price": "IDR 120.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/planetshaker.jpg",
    "link": "https://lynk.id/gudangsequencer/oykp3mvv9mwd",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/ifapxm?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=p70yhv3bxz4",
    "exclusive": true
  },
  {
    "title": "NOEL",
    "artist": "Hillsong Young & Free",
    "price": "IDR 120.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/028_NOEL.jpg",
    "link": "https://lynk.id/gudangsequencer/mryvlqgjw772",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/epovj?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=16psPH-ZiJc",
    "exclusive": true
  },
  {
    "title": "Joy to the World 2017",
    "artist": "Hillsong Worship",
    "price": "IDR 100.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/029_Joy-to-the-World-2017.jpg",
    "link": "https://lynk.id/gudangsequencer/wmpg0404o2jv",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/zpefgt?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=6Fhb8_Ccytk",
    "exclusive": true
  },
  {
    "title": "O Holy Night",
    "artist": "Hillsong Worship",
    "price": "IDR 100.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/030_O-Holy-Night.jpg",
    "link": "https://lynk.id/gudangsequencer/1rzjn7n8edx2",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/yldwv?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=ycdlT8vn1HA",
    "exclusive": true
  },
  {
    "title": "Silent Night",
    "artist": "Planetshaker",
    "price": "IDR 100.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/031_Silent-Night.jpg",
    "link": "https://lynk.id/gudangsequencer/1rzjn7n8edx2",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/ccdkc?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=ycdlT8vn1HA",
    "exclusive": true
  },
  {
    "title": "Angels We Have Heard On High",
    "artist": "Planetshakers",
    "price": "IDR 100.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/032_Angels-We-Have-Heard-On-High.jpg",
    "link": "https://lynk.id/gudangsequencer/n3r1k444dr3n",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/tlaqh?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=npmCb4yhJjw",
    "exclusive": true
  },
  {
    "title": "Hark",
    "artist": "Planetshakers",
    "price": "IDR 100.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/planetshaker.jpg",
    "link": "https://lynk.id/gudangsequencer/okn2roo0ojg1",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/jtetrb?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=b831MMtXdaw",
    "exclusive": true
  },
  {
    "title": "Its Christmas",
    "artist": "Planetshaker",
    "price": "IDR 100.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/its christmas.jpg",
    "link": "https://lynk.id/gudangsequencer/vdngnrgkjkk1",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/lnvixn?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=_SDgCQh74-w",
    "exclusive": true
  },
  {
    "title": "New Things Coming",
    "artist": "Elevation Worship",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/elevation worship 2.jpg",
    "link": "https://lynk.id/gudangsequencer/6z1lyz9j4k12",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/psmnd?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=U0n1__DcfAI",
    "exclusive": false
  },
  {
    "title": "We Raise",
    "artist": "Planetshakers",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/planetshaker.jpg",
    "link": "https://lynk.id/gudangsequencer/woqlqdkedrzp",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/egkvoq?wanted=true",
    "youtube": "",
    "exclusive": false
  },
  {
    "title": "Praise Opening",
    "artist": "Gateway ALL IN",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/037_Praise-Opening.jpg",
    "link": "https://lynk.id/gudangsequencer/21lklwv7yg6l",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/stzap?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=asV-MhzSDYY",
    "exclusive": false
  },
  {
    "title": "In Jesus Name Asia",
    "artist": "Israel & New Breed",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/in jesus name asia.jpg",
    "link": "https://lynk.id/gudangsequencer/523vkzqj9m9y",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/qkhbu?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=1ll4EqvxvDk",
    "exclusive": false
  },
  {
    "title": "This is the Day - Reimagined",
    "artist": "Lakewood Music",
    "price": "IDR 120.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/039_This-is-the-Day-Reimagined.jpg",
    "link": "https://lynk.id/gudangsequencer/nyxyzxqkpop4",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/ectfi?wanted=true",
    "youtube": "",
    "exclusive": false
  },
  {
    "title": "I Know You Can",
    "artist": "Planetshakers",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/planetshaker.jpg",
    "link": "https://lynk.id/gudangsequencer/9kqon61317me",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/ihspm?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=P56B3_nYYuM",
    "exclusive": false
  },
  {
    "title": "Real Love HXL 25",
    "artist": "Hillsong Young & Free",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/041_Real-Love-HXL-25.jpg",
    "link": "https://lynk.id/gudangsequencer/x9rv4o160kp0",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/kgmzj?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=6y73U5KwPKU",
    "exclusive": false
  },
  {
    "title": "Holy Forever",
    "artist": "Bethel Music and Jenn Johnson",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/elevation worship 2.jpg",
    "link": "https://lynk.id/gudangsequencer/l9w339mkkzy3",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/agelt?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=U0n1__DcfAI",
    "exclusive": false
  },
  {
    "title": "Fill the Room",
    "artist": "Todd Galberth",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/043_Fill-the-Room.jpg",
    "link": "https://lynk.id/gudangsequencer/wxv3d8lmk9y1",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/lgvai?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=v0XYCvjMxCM",
    "exclusive": false
  },
  {
    "title": "Now Aint that Something",
    "artist": "Lakewood Music",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/044_Now-Aint-that-Something.jpg",
    "link": "https://lynk.id/gudangsequencer/j6p02601zn32",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/ckvlij?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=jwD0jRME674",
    "exclusive": false
  },
  {
    "title": "Goodbye Yesterday",
    "artist": "ELEVATION RHYTHM",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/045_Goodbye-Yesterday.jpg",
    "link": "https://lynk.id/gudangsequencer/qe85oo2xz88l",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/egtdka?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=1qjOJP2qyeE",
    "exclusive": false
  },
  {
    "title": "Real Love (Original)",
    "artist": "Young & Free",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/this is living.jpg",
    "link": "https://lynk.id/gudangsequencer/qe85oo2xz88l",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/kgmzj?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=Uf01L4lsetM",
    "exclusive": false
  },
  {
    "title": "O Come Medley Carol of The Bells",
    "artist": "Chris Rocha",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/047_O-Come-Medley-Carol-of-The-Bells.jpg",
    "link": "https://lynk.id/gudangsequencer/k67pqnk1xd1j",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/wnllz?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=f2M9YjNKSMc",
    "exclusive": true
  },
  {
    "title": "In Jesus Name (Darlene)",
    "artist": "Darlene Zschech",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/048_In-Jesus-Name-Darlene.jpg",
    "link": "https://lynk.id/gudangsequencer/592pl7k9qm8r",
    "gumroadLink": "",
    "youtube": "https://www.youtube.com/watch?v=1ll4EqvxvDk",
    "exclusive": false
  },
  {
    "title": "I Speak Jesus",
    "artist": "Charity Gayle",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/049_I-Speak-Jesus.jpg",
    "link": "https://lynk.id/gudangsequencer/o4xzq3zdg36w",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/gymzmm?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=2G4QoUhy2Ac",
    "exclusive": false
  },
  {
    "title": "This is the Day",
    "artist": "Lakewood Music",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/lakewood.jpg",
    "link": "https://lynk.id/gudangsequencer/3417ervkxq64",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/msvfwm?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=XG7NnClqymE",
    "exclusive": false
  },
  {
    "title": "You Are Good (in LA)",
    "artist": "Israel Houghton",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/051_You-Are-Good-in-LA.jpg",
    "link": "https://lynk.id/gudangsequencer/9248oz68oz1z",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/wohmcj?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=40FwQ03nkPg",
    "exclusive": false
  },
  {
    "title": "You Are Good (Original)",
    "artist": "Israel Houghton",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/052_You-Are-Good-Original.jpg",
    "link": "https://lynk.id/gudangsequencer/9248oz68oz1z",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/spitis?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=-hl-HCpqr3I",
    "exclusive": false
  },
  {
    "title": "Impossible Possible",
    "artist": "Lakewood Music",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/053_Impossible-Possible.jpg",
    "link": "https://lynk.id/gudangsequencer/q20wwz5p6kpv",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/hwius?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=rsnpOg0elQQ",
    "exclusive": false
  },
  {
    "title": "Echo (ft. Tauren W)",
    "artist": "Elevation Worship",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/echo elevation.jpg",
    "link": "https://lynk.id/gudangsequencer/r054qee22vrz",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/tuhipo?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=uCpk8AEwMV4",
    "exclusive": false
  },
  {
    "title": "In Jesus Name (DOE)",
    "artist": "Israel Houghton ft. DOE",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/055_In-Jesus-Name-DOE.jpg",
    "link": "https://lynk.id/gudangsequencer/36v97ozy1n7x",
    "gumroadLink": "",
    "youtube": "https://www.youtube.com/watch?v=RFk-1ZBvJco",
    "exclusive": false
  },
  {
    "title": "KAMSAHAMNIDA",
    "artist": "Planetboom",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/kamsahamnida.jpg",
    "link": "https://lynk.id/gudangsequencer/0nv6vwezvy75",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/bofxmx?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=4jiSNvl2rFs",
    "exclusive": false
  },
  {
    "title": "This is our Time",
    "artist": "Planetshakers",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/057_This-is-our-Time.jpg",
    "link": "https://lynk.id/gudangsequencer/0v3m7n37r606",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/hnfjfu?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=MeP4C6XOwNo",
    "exclusive": false
  },
  {
    "title": "Trust in God",
    "artist": "Elevation Worship",
    "price": "IDR 120.000",
    "category": [
      "worship"
    ],
    "image": "assets/thumbnail/058_Trust-in-God.jpg",
    "link": "https://lynk.id/gudangsequencer/32jn4zewe1n3",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/lpehuu?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=-vSvhs8vmtA",
    "exclusive": false
  },
  {
    "title": "Terangmu",
    "artist": "Lifeline Music",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/059_Terangmu.jpg",
    "link": "https://lynk.id/gudangsequencer/d3rgvnx61v3m",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/xfwecn?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=FBT6IhDIvvc",
    "exclusive": false
  },
  {
    "title": "Selidiki Aku",
    "artist": "JPCC Worship",
    "price": "IDR 120.000",
    "category": [
      "worship"
    ],
    "image": "assets/thumbnail/060_Selidiki-Aku.jpg",
    "link": "https://lynk.id/gudangsequencer/3o3z826jojwr",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/vnkijy?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=UY6Bl9rfYWs",
    "exclusive": false
  },
  {
    "title": "Nyata Sempurna",
    "artist": "NDC Worship",
    "price": "IDR 120.000",
    "category": [
      "worship"
    ],
    "image": "assets/thumbnail/061_Nyata-Sempurna.jpg",
    "link": "https://lynk.id/gudangsequencer/ovro6541or6g",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/kofmnt?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=hXEh9H2rqUk",
    "exclusive": false
  },
  {
    "title": "Hari Terbaik",
    "artist": "LOJ Worship",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/hari terbaik.jpg",
    "link": "https://lynk.id/gudangsequencer/p5xjj25e22g1",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/bpedjc?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=cXbOneetRg4",
    "exclusive": false
  },
  {
    "title": "Bangkit dan Puji Dia",
    "artist": "Lifeline Music",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/bangkit dan puji dia.jpg",
    "link": "https://lynk.id/gudangsequencer/zkddzxk1xwk9",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/qpgbsu?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=cOL_k5rF0k8",
    "exclusive": false
  },
  {
    "title": "Berserah Penuh",
    "artist": "NDC Worship",
    "price": "IDR 120.000",
    "category": [
      "worship"
    ],
    "image": "assets/thumbnail/ndc worship.jpg",
    "link": "https://lynk.id/gudangsequencer/rp2x7v3v652p",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/lxtey?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=sCT7BUfys3c",
    "exclusive": false
  },
  {
    "title": "Raja atas Sgalanya",
    "artist": "NDC Worship",
    "price": "IDR 120.000",
    "category": [
      "worship"
    ],
    "image": "assets/thumbnail/065_Raja-atas-Sgalanya.jpg",
    "link": "https://lynk.id/gudangsequencer/mwjr892o57lk",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/jruidq?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=Hu-abx9EvkE",
    "exclusive": false
  },
  {
    "title": "Sejarah Hidupku",
    "artist": "NDC Worship",
    "price": "IDR 120.000",
    "category": [
      "worship"
    ],
    "image": "assets/thumbnail/066_Sejarah-Hidupku.jpg",
    "link": "https://lynk.id/gudangsequencer/v5wwqmno7n72",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/lpdwwy?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=5X1osyPwl1E",
    "exclusive": false
  },
  {
    "title": "Never Lost",
    "artist": "Elevation Worship",
    "price": "Free",
    "category": [
      "praise",
      "freebies"
    ],
    "image": "assets/thumbnail/elevation worship 2.jpg",
    "link": "https://lynk.id/gudangsequencer/nk89qpwwd06n",
    "drive-link": "https://drive.google.com/drive/folders/1ocbPybyfMwEb0spqovbvImOwZTb1kK5C?usp=sharing",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/axfdo?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=b01nYd3Lv14",
    "exclusive": false
  },
  {
    "title": "Bukti Kasihmu (NDC)",
    "artist": "NDC Worship",
    "price": "IDR 120.000",
    "category": [
      "worship"
    ],
    "image": "assets/thumbnail/068_Bukti-Kasihmu-NDC.jpg",
    "link": "https://lynk.id/gudangsequencer/pq0l8or7m184",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/mmlmg?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=oIoyodPbsqc",
    "exclusive": false
  },
  {
    "title": "Tempat Pertama",
    "artist": "Bestindo Music",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/bestindo music.jpg",
    "link": "https://lynk.id/gudangsequencer/nywv21v0k6x8",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/xonta?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=tEgeFrkJOv0",
    "exclusive": false
  },
  {
    "title": "Serukan Namanya",
    "artist": "JPCC Worship",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/02_Yesus-Raja-JPCC.jpg",
    "link": "https://lynk.id/gudangsequencer/g4yl32on4kod",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/gvlvoh?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=7cGejz0xUIE",
    "exclusive": false
  },
  {
    "title": "Satu Persembahan",
    "artist": "Intimately Known",
    "price": "IDR 120.000",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/071_Satu-Persembahan.jpg",
    "link": "https://lynk.id/gudangsequencer/vrdn2qwpr515",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/lrtbtv?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=DdzOXzUvR-g",
    "exclusive": false
  },
  {
    "title": "Kuteringat",
    "artist": "Symphony Worship Family",
    "price": "Free",
    "category": [
      "praise"
    ],
    "image": "assets/thumbnail/kuteringat.jpg",
    "drive-link": "https://drive.google.com/file/d/1OpIooyeKaD6b8HymdHDSpUZpZHxFfaup/view?usp=drive_link",
    "link": "https://lynk.id/gudangsequencer/6qk6ldgroy1g",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/ooqscr?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=dZ9uosoi-Pk",
    "exclusive": false
  },
  {
    "title": "Dia Raja (WN)",
    "artist": "Worship Nite Project",
    "price": "IDR 120.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/073_Dia-Raja-WN.jpg",
    "link": "https://lynk.id/gudangsequencer/pr4211y82ye2",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/ogaesq?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=O9fCbsDVkhU",
    "exclusive": false
  },
  {
    "title": "Praise",
    "artist": "Elevation Worship",
    "price": "Free",
    "category": [
      "praise",
      "freebies"
    ],
    "image": "assets/thumbnail/074_Praise.jpg",
    "link": "https://lynk.id/gudangsequencer/1o35kj6v9jm3",
    "drive-link": "https://drive.google.com/file/d/16xGPUtypGzL5S-PLDglIqXmdw0_si04U/view?usp=drive_link",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/lmxzue?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=uCpk8AEwMV4",
    "exclusive": false
  },
  {
    "title": "Aku Diberkati 2025 Remix",
    "artist": "Sound of Praise",
    "price": "IDR 120.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/075_Aku-Diberkati-2025-Remix.jpg",
    "link": "https://lynk.id/gudangsequencer/lj309y3vnpvd",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/xhcrpc?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=Kl-cyDe4IZ8",
    "exclusive": false
  },
  {
    "title": "Nyalakan Apimu",
    "artist": "New Life Church",
    "price": "IDR 70.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/076_Nyalakan-Apimu.jpg",
    "link": "https://lynk.id/gudangsequencer/vp0xlye26vjk",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/bwnfhh?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=jAeh7dFrJtQ",
    "exclusive": false
  },
  {
    "title": "Kunaikkan Syukurku 2025",
    "artist": "NDC Worship",
    "price": "IDR 120.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/077_Kunaikkan-Syukurku-2025.jpg",
    "link": "https://lynk.id/gudangsequencer/lwelm3rlddgk",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/abdpsu?wanted=true",
    "youtube": "",
    "exclusive": false
  },
  {
    "title": "Dari Pulau & Gita Sorga",
    "artist": "Joshua Sentosa, NDC",
    "price": "IDR 120.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/078_Dari-Pulau-Gita-Sorga.jpg",
    "link": "https://lynk.id/gudangsequencer/vkvoex2704zq",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/uyhwe?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=mvLgfT6osAY",
    "exclusive": false
  },
  {
    "title": "Ajaib kau Tuhan",
    "artist": "Joshua Sentosa, NDC",
    "price": "IDR 120.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/079_Ajaib-kau-Tuhan.jpg",
    "link": "https://lynk.id/gudangsequencer/0vdrz2krz9rn",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/hrromk?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=gWkFx5drzLU",
    "exclusive": false
  },
  {
    "title": "Endless Praise",
    "artist": "Recording Collective",
    "price": "IDR 120.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/080_Endless-Praise.jpg",
    "link": "https://lynk.id/gudangsequencer/p1d6okxxd054",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/trndq?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=KxjMZ87WWKY",
    "exclusive": false
  },
  {
    "title": "Oleh Darah Anak Domba",
    "artist": "Joshua Sentosa, NDC",
    "price": "IDR 120.000",
    "category": [
      "praise",
      "rearrangement"
    ],
    "image": "assets/thumbnail/081_Oleh-Darah-Anak-Domba.jpg",
    "link": "https://lynk.id/gudangsequencer/l20mv78q6y56",
    "gumroadLink": "https://voltdsecretvault.gumroad.com/l/txjyvc?wanted=true",
    "youtube": "https://www.youtube.com/watch?v=k7gZphY-Cvg",
    "exclusive": false
  }
];



if (typeof module !== "undefined") {

  module.exports = products;

}



// Browser bridge for TuneTrack catalog page
window.products = products;
window.TuneTrackCatalog = products;

// Product-page integration schema.
// Existing catalog fields remain unchanged.
// Optional fields can be added later per product:
// id, format, catalogNumber, rpm, trackCount, trackQuality,
// tracks/tracklist, credits, and other product-specific metadata.
window.TuneTrackCatalogSchemaVersion = 1;
