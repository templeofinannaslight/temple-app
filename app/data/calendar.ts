export interface CalendarMonth {
  num: number
  akkadian: string
  sumerian: string
  approx: string
  season: string
  theme: string
  mythCycle: string
  mythDesc: string
  festivals: string[]
  practices: string
  lunarNote: string
  color: string
}

export const MONTHS: CalendarMonth[] = [
  {
    num: 1,
    akkadian: "Barazagar",
    sumerian: "𒌗𒁈𒍠𒃻 · Dais of the Sanctuary",
    approx: "Mar – Apr",
    season: "Spring Equinox",
    theme: "Sacred New Year",
    mythCycle: "Zagmuk / Akitu",
    mythDesc:
      "The Sumerian year begins with the first sunrise after the first new moon after the spring equinox. At Nippur, 𒀭Enlil's statue is enthroned in glory at the E-kur, the mountain house. The Zagmuk — New Year festival — commemorates the bond between humanity and the gods, recreates the gods' entry into their cities and dwelling places, and opens space for mourning and reflection of the old year to be replaced by the hopes and ambitions of the new.",
    festivals: [
      "Zagmuk / Akitu — New Year festival (several days)",
      "Enthronement of 𒀭Enlil at the E-kur of Nippur",
      "Ešeš — Great Offering to all household gods (day 15, full moon)",
      "Kisiga — funerary libations at the new moon (last day of month)",
    ],
    practices:
      "Light all lamps. Set intentions for the sacred year. Reflect on what the old year has taught you and what you carry forward. Make offerings of first barley. Honor 𒀭Inanna as Queen of Heaven enthroned in full radiance.",
    lunarNote:
      "The year begins with the first new moon after the vernal equinox. Day and night stand in perfect balance at the threshold of the new sacred year.",
    color: "#C9A84C",
  },
  {
    num: 2,
    akkadian: "Gusisu",
    sumerian: "𒌗𒄞𒋛𒁲 · Marching Forth of Oxen",
    approx: "Apr – May",
    season: "Late Spring",
    theme: "Agricultural Preparation",
    mythCycle: "𒀭Ninurta, Lord of the Plough",
    mythDesc:
      "The calendars of the various city-states of Sumer were based on the local agricultural cycle. This month's name refers to the plough pulled by oxen. It marks the beginning of the agricultural season, though actual ploughing would not begin until the fourth month — Gusisu was a time to select oxen and ensure sufficient equipment for the year's work. The month is particularly sacred to 𒀭Ninurta, Lord of the Plough, given the honorific Lugalgusisu, 'king who directs the marching oxen.'",
    festivals: [
      "Ezem Gusisu — Festival of the Marching Oxen (days 20–22)",
      "𒀭Ninurta given highest honours on the third festival day",
      "Ešeš — Great Offering to all household gods (day 15, full moon)",
      "Kisiga — funerary libations at the new moon (last day of month)",
    ],
    practices:
      "Reflect on the intentions set at the New Year and consider what resources, tools, and relationships you will need to manifest them. Tend to practical preparations. Honour 𒀭Ninurta as the force that organises sacred labour.",
    lunarNote:
      "The flood recedes and wet earth awaits the plough. 𒀭Ninurta's victory over 𒀭Asag — the demon of rocky ground — is felt in the land's new readiness.",
    color: "#8DB580",
  },
  {
    num: 3,
    akkadian: "Sig Ga",
    sumerian: "𒌗𒋞𒂵 · Placing of Bricks",
    approx: "May – Jun",
    season: "Early Summer",
    theme: "Foundation & Craft",
    mythCycle: "𒀭Kulla, God of Bricks",
    mythDesc:
      "The month's name is a shortening of 'the month the bricks are placed in the brick mould.' With ritual agricultural preparations completed, attention turned to the labour of the cities — making the vast quantities of mud bricks vital for new projects and rebuilding. We use this month to lay firm foundations and pray for righteous guidance in all work that glorifies the gods.",
    festivals: [
      "Ceremony of the Placing of Bricks (city of Umma, mid-month)",
      "Holy days of 𒀭Kulla, brick god and foundation-layer",
      "Ešeš — Great Offering to all household gods (day 15, full moon)",
      "Kisiga — funerary libations at the new moon (last day of month)",
    ],
    practices:
      "Inaugurate and renew projects. Lay foundations — spiritual, creative, material. Pray for guidance in your labours. If you build an altar, craft a sacred object, or begin new work, this is the month to start.",
    lunarNote:
      "Long spring days. The cities are alive with labour. Brick by brick, the temples rise toward the open sky.",
    color: "#D4A0A0",
  },
  {
    num: 4,
    akkadian: "Šunumun",
    sumerian: "𒌗𒋗𒆰𒈾 · Seeding",
    approx: "Jun – Jul",
    season: "Summer Solstice",
    theme: "Mourning of 𒀭Dumuzi",
    mythCycle: "𒀭Dumuzi Taken Below",
    mythDesc:
      "Despite its name, the brutal Mesopotamian heat makes actual seeding impossible. Instead, the fields are prepared — weeded, cleared of stones and the stubble of the previous harvest. In Akkadian this month is called Tammuz, a form of the name 𒀭Dumuzi, consort of 𒀭Inanna, who is dragged to the underworld for six months of every year as recounted in the Descent. The fourth month is a time of ritual mourning as the fertility of the land withdraws with him.",
    festivals: [
      "Three-day lamentation for 𒀭Dumuzi at the dark moon",
      "Weeping rites at the gate",
      "Summer solstice observance",
      "Ešeš — Great Offering to all household gods (day 15, full moon)",
      "Kisiga — funerary libations at the new moon (last day of month)",
    ],
    practices:
      "Clear your inner fields. Remove the accumulated debris of the year — resentments, distractions, unfinished grief — to prepare for new growth. Sit with loss. Light no celebratory fires. If you feel 𒀭Dumuzi's absence in the world, that feeling is sacred.",
    lunarNote:
      "At the dark moon, the three-day lamentation begins. The moon joins 𒀭Dumuzi in the underworld. The land begins to wither in the summer heat.",
    color: "#6B4C3B",
  },
  {
    num: 5,
    akkadian: "Nenegar",
    sumerian: "𒌗𒉈𒉈𒃻 · Lighting of the Braziers",
    approx: "Jul – Aug",
    season: "High Summer",
    theme: "Festival of Spirits",
    mythCycle: "The Worlds Draw Close",
    mythDesc:
      "The height of the Mesopotamian summer: the hot sun dries and cracks the Earth and no agricultural work is possible. With the world rendered lifeless, the boundary between the living and the dead grows thin. Fires and braziers are lit to invite the glorious dead home and to drive away wandering, unpacified spirits. Offerings go not only to the glorious dead, but to the gods who shepherd them and to the chthonic deities who watch over the underworld.",
    festivals: [
      "Festival of Spirits (end of month) — braziers lit for the dead",
      "Ceremonial meal shared with returning ancestors",
      "Offerings to shepherd-gods of the dead and chthonic deities",
      "Ešeš — Great Offering to all household gods (day 15, full moon)",
      "Kisiga — funerary libations at the new moon (last day of month)",
    ],
    practices:
      "Honor your dead. Prepare a ceremonial meal for your ancestors. Light fires — not in celebration, but as invitation. Sit in the heat and let the boundary between worlds be real to you. Contemplate what has been lost and what still endures.",
    lunarNote:
      "The hottest month. Fires burn for the spirits. The veil between worlds thins in the scorching air as the earth lies still.",
    color: "#8B4513",
  },
  {
    num: 6,
    akkadian: "Kin 𒀭Inanna",
    sumerian: "𒌗𒆥𒀭𒈹 · The Labours of 𒀭Inanna",
    approx: "Aug – Sep",
    season: "Late Summer",
    theme: "The Life of 𒀭Inanna",
    mythCycle: "Adornment, Descent & Return",
    mythDesc:
      "The sixth month belongs entirely to 𒀭Inanna. Her statue is adorned in fine jewellery, luxurious robes, and all the divine powers. She visits the temples of 𒀭Enlil and 𒀭Nanna and is received with feasting and honour. At the full moon, the Great Offering is given in her name. The second half of the month re-enacts the Descent — she sets off for the underworld while offerings continue. Around day 21 she returns; her statue is ceremonially bathed and re-invested in full glory. The month closes with myths of how 𒀭Inanna won her powers from 𒀭An, 𒀭Enki, and the Anuna gods.",
    festivals: [
      "Adornment of 𒀭Inanna's statue (month opening)",
      "Procession to the temples of 𒀭Enlil and 𒀭Nanna",
      "Ešeš — Great Offering in 𒀭Inanna's name (day 15, full moon)",
      "Symbolic Descent re-enacted (second half of month)",
      "Return and ceremonial bathing of 𒀭Inanna's statue (around day 21)",
      "Recitation of myths of 𒀭Inanna's power (through day 26)",
      "Kisiga — funerary libations at the new moon (last day of month)",
    ],
    practices:
      "Adorn yourself with intention. Visit or make offerings at spaces that feel holy to you. At the full moon, make your most generous offering of the year. In the second half of the month, sit with the Descent — what must you surrender to pass the gates? Welcome her return with bathing, beauty, and praise.",
    lunarNote:
      "The great month of 𒀭Inanna. The full moon is the height of her adoration. At the dark moon she descends — and with the new crescent, she returns.",
    color: "#4A6FA5",
  },
  {
    num: 7,
    akkadian: "Duku",
    sumerian: "𒌗𒇯𒆬 · The Sacred Mound",
    approx: "Sep – Oct",
    season: "Autumn Equinox",
    theme: "Second New Year",
    mythCycle: "The Primordial Hill",
    mythDesc:
      "The seventh month begins the second half of the sacred year with its own akitu festival — the ancients divided the solar cycle at both equinoxes. The Duku is the Sacred Mound of Sumerian cosmology: the place where the earth first emerged from the primordial waters, the seat of the ancestors of the gods, the hill where plants and animals were first created. Its festival hearkens back before civilisation, before writing and agriculture, to the first moment of becoming.",
    festivals: [
      "Autumn Akitu festival",
      "Festival of the Sacred Mound (Duku)",
      "Equinox observance",
      "Ešeš — Great Offering to all household gods (day 15, full moon)",
      "Kisiga — funerary libations at the new moon (last day of month)",
    ],
    practices:
      "Honor your personal gods' origins and lineage. Tend to the primordial — go to water, to earth, to the sky. Celebrate the harvest beginning. Give thanks for what has grown from the ground you prepared in spring.",
    lunarNote:
      "The second equinox — balance returns. The year tips toward the dark, but the harvest comes in. 𒀭Inanna walks above in full glory.",
    color: "#C9A84C",
  },
  {
    num: 8,
    akkadian: "Apin Dua",
    sumerian: "𒌗𒀳𒃮𒀀 · Releasing of the Plough",
    approx: "Oct – Nov",
    season: "Early Autumn",
    theme: "Completion",
    mythCycle: "The Plough is Put to Rest",
    mythDesc:
      "The plough, prepared in the second month and laboured through the seeding season, is now released and put away. Seeding is complete and the people await the harvest. It is a time to check off milestones and tie off loose ends. In cities along the lower rivers — Ur, Isin, Larsa, Adab — the Festival of Spirits was observed again this month, reflecting how communities honoured regional variation in ancestral practice.",
    festivals: [
      "Ceremony of Releasing the Plough",
      "Festival of Spirits (attested at Ur, Isin, Larsa, Adab)",
      "Brazier observances in some traditions",
      "Ešeš — Great Offering to all household gods (day 15, full moon)",
      "Kisiga — funerary libations at the new moon (last day of month)",
    ],
    practices:
      "Take account of what you have committed to this year. What is complete and can be set down? What loose ends remain? Honor the work. Release what is finished with gratitude.",
    lunarNote:
      "The plowing month draws to a close. Seeds rest in dark earth. The dead are honored again as the world darkens toward winter.",
    color: "#7B6B5D",
  },
  {
    num: 9,
    akkadian: "Gan Gan-e",
    sumerian: "𒌗𒃶𒃶𒈾 · Coming of Clouds",
    approx: "Nov – Dec",
    season: "Late Autumn",
    theme: "Anticipation",
    mythCycle: "𒀭Iškur and the Storm",
    mythDesc:
      "Sparse as rainfall was on the alluvial plain of Sumer, such clouds as appeared in the sky would be found this month — marking the start of the growing season. A time of anticipation for the fruits of labour to be revealed. The month is sacred to 𒀭Iškur, the storm god, whose Festival of Clouds falls near the end of the month.",
    festivals: [
      "Festival of Clouds (late month, sacred to 𒀭Iškur)",
      "Ešeš — Great Offering to all household gods (day 15, full moon)",
      "Kisiga — funerary libations at the new moon (last day of month)",
    ],
    practices:
      "Keep faith with the path you have been walking all year. The work is not yet done, but the clouds that come before rain are a promise. Carry on your endeavours toward the year's final push. Make offerings in gratitude for what is coming.",
    lunarNote:
      "Cold approaches. The first clouds appear. 𒀭Iškur stirs. The land waits — as all faithful waiting does — for what was promised.",
    color: "#5D5D7B",
  },
  {
    num: 10,
    akkadian: "Kusu",
    sumerian: "𒌗𒆬𒋆 · Lady of the Grain",
    approx: "Dec – Jan",
    season: "Winter Solstice",
    theme: "Grain Goddess",
    mythCycle: "𒀭Ezina-Kusu / 𒀭Nisaba",
    mythDesc:
      "The name invokes 𒀭Ezina-Kusu, a grain goddess of Nippur tied to a mythological cycle of 𒀭Enlil, later identified with 𒀭Nisaba, goddess of scribes and grain. The sight of the amber waves of grain approaching full height filled this month with awe. No specific festivals are attested, but the month stands as a mirror of the fourth month — at the same position in the equinox-year — a time of preparation for the imminent harvest. (Around 2000 BCE the month was renamed Abbe by Nippur alone, resisting political pressure from the king Šulgi.)",
    festivals: [
      "Devotion to 𒀭Ezina-Kusu and 𒀭Nisaba (no fixed festival attested)",
      "Winter solstice observance",
      "Ešeš — Great Offering to all household gods (day 15, full moon)",
      "Kisiga — funerary libations at the new moon (last day of month)",
    ],
    practices:
      "Prepare for the harvest to come. Tend to grain, bread, nourishment — what sustains your community and your body. Honor 𒀭Nisaba: read, write, study. If you practice divination, this is an excellent month for it. Give thanks by candlelight through the longest nights.",
    lunarNote:
      "The solstice. The longest nights. 𒀭Nisaba's grain stands tall in the amber of winter light, almost ready to be gathered in.",
    color: "#9B3B3B",
  },
  {
    num: 11,
    akkadian: "Uduru",
    sumerian: "𒌗𒍩𒀀 · Emmer",
    approx: "Jan – Feb",
    season: "Deep Winter",
    theme: "Harvest Begins",
    mythCycle: "The Ingathering",
    mythDesc:
      "With the onset of Uduru, the harvest season begins in earnest. Emmer and barley were the principal crops of Sumer, and the month of Emmer marks the start of the ingathering — the gathering in of all that will sustain temples, households, and communities through the year ahead. The work of the harvest was hard, but it was faced with anticipation, song, and the deep satisfaction of reaping what was sown.",
    festivals: [
      "Beginning of the harvest season",
      "Offering of first emmer wheat",
      "Ešeš — Great Offering to all household gods (day 15, full moon)",
      "Kisiga — funerary libations at the new moon (last day of month)",
    ],
    practices:
      "Harvest what you have grown — in your life, your practice, your relationships. Gather in and store up what will sustain you through the year ahead. Rise before dawn. Work with your hands. Offer first fruits. Sing.",
    lunarNote:
      "Deep winter, but the earth is yielding. Emmer comes in first. The harvest is underway — cold air filled with the scent of cut grain.",
    color: "#4A7B8C",
  },
  {
    num: 12,
    akkadian: "Šekinku",
    sumerian: "𒌗𒊺𒆥𒋻 · Reaping of Barley",
    approx: "Feb – Mar",
    season: "Late Winter",
    theme: "Culmination",
    mythCycle: "Festival of Barley",
    mythDesc:
      "The culmination of the year's agricultural cycle. Barley — which adapts and grows better in Mesopotamian soil than emmer and was of vital economic importance — is now harvested. The Festival of Barley takes place around the full moon, with honour, offerings, and praise given to the gods. At Nippur, this festival was principally sacred to 𒀭Enlil and 𒀭Ezina. It is a time to give thanks for the year's growth and store the year's legacy as foundation for the next.",
    festivals: [
      "Festival of Barley (at full moon, sacred to 𒀭Enlil and 𒀭Ezina at Nippur)",
      "Ešeš — Great Offering to all household gods (day 15, full moon)",
      "Kisiga — funerary libations at the new moon (last day of month)",
      "Preparation for Akitu — the new year approaches",
    ],
    practices:
      "Give thanks for everything the year has yielded. Complete unfinished work. Settle debts — material and spiritual. Prepare offerings for the New Year. Reflect on the full cycle you have traveled. Store the legacy of what you have learned.",
    lunarNote:
      "The last full moon before the new year. Barley fills the storehouses. The cycle prepares to turn. Everything is ending. Everything is about to begin.",
    color: "#6B8C6B",
  },
  {
    num: 13,
    akkadian: "Diri Šekinku",
    sumerian: "𒌗𒋛𒀀𒊺𒆥𒋻 · Second Reaping of Barley",
    approx: "Intercalary",
    season: "Between Years",
    theme: "Restoration of Harmony",
    mythCycle: "Outside of Time",
    mythDesc:
      "The intercalary month exists outside the regular sacred cycle — inserted in years 3, 6, 8, 11, 14, 17, and 19 of every 19-year Metonic cycle to restore harmony between the moon and sun (235 lunar months make up almost exactly 19 solar years; our current cycle began with the Sumerian year that opened in March 2007). When the procession of the heavens calls for it, this month falls at year's end as a second barley harvest. In year 17 of the cycle, it falls instead after month 6 and is called Diri Kin 𒀭Inanna — Second Labours of 𒀭Inanna.",
    festivals: [
      "No fixed festivals — a month of personal devotion",
      "Mirrors the observances of month 12",
      "Additional kisiga rites if moved by grief",
      "Ešeš — Great Offering to all household gods (day 15, full moon)",
      "Kisiga — funerary libations at the new moon (last day of month)",
    ],
    practices:
      "Use this time as pure grace. No liturgical obligations are fixed. Meditate, create, rest, complete. Let the world realign. If this month falls as Diri Kin 𒀭Inanna, deepen your devotion to 𒀭Inanna in all her aspects.",
    lunarNote:
      "Liminal time — outside the calendar, sacred precisely because it restores balance. The moon and sun are brought back into harmony.",
    color: "#8B7BAA",
  },
]

export interface LunarPhase {
  name: string
  icon: string
  day: number
  desc: string
  /** Astronomical moment (UTC) for phases with an exact conjunction / quarter
   *  / opposition time — accurate to ≈1 minute. */
  moment?: Date
  /** Mid-bucket estimate (UTC) for phases that span multiple days (waxing
   *  crescent / waxing gibbous / waning gibbous / waning crescent). Useful
   *  precision: ±12 hours. Also used to anchor calendar-defined entries
   *  (New Crescent, Dark Moon) to their canonical Day 1 / Day N dates. */
  momentEstimate?: Date
  /** Short note shown beneath the time block in the detail card — e.g.
   *  "Sumerian month begins at first crescent at sunset." */
  momentNote?: string
}

export const LUNAR_PHASES: LunarPhase[] = [
  {
    name: "New Crescent",
    icon: "🌑",
    day: 1,
    desc: "Month begins — first crescent sighted at sunset",
  },
  { name: "Waxing Crescent", icon: "🌒", day: 4, desc: "Growth, intention-setting" },
  {
    name: "First Quarter",
    icon: "🌓",
    day: 7,
    desc: "Ešeš observed in many cities — lamentation, reflection",
  },
  { name: "Waxing Gibbous", icon: "🌔", day: 11, desc: "Building toward the ešeš" },
  {
    name: "Full Moon (Ešeš)",
    icon: "🌕",
    day: 15,
    desc: "Ešeš — Great Offering to all gods of the household",
  },
  { name: "Waning Gibbous", icon: "🌖", day: 19, desc: "Release, gratitude" },
  { name: "Last Quarter", icon: "🌗", day: 22, desc: "Turning inward" },
  {
    name: "Waning Crescent",
    icon: "🌘",
    day: 26,
    desc: "Kisiga approaches — honor your ancestors",
  },
  {
    name: "Dark Moon (Kisiga)",
    icon: "⚫",
    day: 29,
    desc: "Kisiga — funerary libations for the beloved dead",
  },
]

export const MONTH_NAME_TO_INDEX: Record<string, number> = {
  "Barazagar": 0,
  "Gusisu": 1,
  "Sig Ga": 2,
  "Šunumun": 3,
  "Nenegar": 4,
  "Kin Inanna": 5,
  "Duku": 6,
  "Apin Dua": 7,
  "Gan Gan-e": 8,
  "Kusu": 9,
  "Uduru": 10,
  "Šekinku": 11,
  "Diri Šekinku": 12,
  "Diri Kin Inanna": 12,
}

export const LONG_YEAR_POSITIONS = [3, 6, 8, 11, 14, 17, 19]
