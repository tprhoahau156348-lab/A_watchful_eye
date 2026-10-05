const readline = require('readline');

// הגדרת צבעים לטרמינל
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

// הגדרת גבולות הזמן להמתנה רנדומלית בין התראות (בשניות)
const MIN_INTERVAL = 2.0;
const MAX_INTERVAL = 50.0;

// מאגרי נתונים ליצירת התראות אקראיות
const ALERT_NAMES = [
  "תנועה חשודה בגדר המערכת",
  "זיהוי כלי טיס עוין",
  "שיגור רקטי מטווח קצר",
  "שיבושי קשר וספקטרום",
  "חוליה חמושה בציר מרכזי",
  "דיווח תצפית על רחפן לא מזוהה",
  "התקפת סייבר על בסיס רשת",
];

const DESCRIPTIONS = [
  'זיהוי תנועה חריגה במרחב האבטחה על ידי תצפית צה"ל.',
  "התקבלה אינדיקציה מודיעינית ראשונית שדורשת בדיקה מיידית.",
  'אירוע מתגלגל בגזרה, נדרשת הגברת ערנות בחמ"ל.',
  "דיווח שהתקבל מגורמי השטח בעקבות זיהוי מכ\"ם.",
  "חריגה מנהלי אבטחה שגרתיים במרחב המוגן.",
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const ARENAS = ["North", "South", "Center"];

// מיקומים אמיתיים לכל פיקוד: [שם, x (אורך), y (רוחב)]
const LOCATIONS = {
  North: [
    ["קריית שמונה", 35.5697, 33.2075],
    ["צפת", 35.496, 32.9646],
    ["כרמיאל", 35.296, 32.919],
    ["מעלות-תרשיחא", 35.27, 33.0167],
    ["קצרין", 35.69, 32.993],
    ["עפולה", 35.2897, 32.6078],
    ["נצרת", 35.3035, 32.6996],
    ["מגדל העמק", 35.24, 32.677],
    ["קריית אתא", 35.11, 32.809],
  ],
  Center: [
    ["חדרה", 34.9196, 32.434],
    ["כפר סבא", 34.9066, 32.175],
    ["הוד השרון", 34.89, 32.15],
    ["פתח תקווה", 34.8878, 32.084],
    ["רמת גן", 34.8248, 32.0684],
    ['נתב"ג', 34.8854, 32.0055],
    ["ראשון לציון", 34.7925, 31.973],
    ["לוד", 34.898, 31.952],
    ["רמלה", 34.8667, 31.9297],
    ["רחובות", 34.8113, 31.894],
    ["שוהם", 34.947, 32.0],
    ["ראש העין", 34.957, 32.095],
    ["בית שמש", 34.9881, 31.747],
    ["ירושלים", 35.19, 31.78],
  ],
  South: [
    ["שדרות", 34.5953, 31.5253],
    ["נתיבות", 34.5891, 31.4234],
    ["אופקים", 34.62, 31.314],
    ["קריית גת", 34.764, 31.61],
    ["באר שבע", 34.7915, 31.253],
    ["רהט", 34.755, 31.393],
    ["ערד", 35.2124, 31.2588],
    ["דימונה", 35.0326, 31.0703],
    ["ירוחם", 34.929, 30.988],
    ["מצפה רמון", 34.8008, 30.6097],
    ["עובדה", 34.9358, 29.9403],
  ],
};

const JITTER = 0.01;

const ARENA_LATITUDE = {
  North: [32.5, 34.0],
  Center: [31.72, 32.5],
  South: [29.0, 31.72],
};

// פונקציות עזר רנדומליות
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomFloat = (min, max) => Math.random() * (max - min) + min;

function checkLocations() {
  for (const [arena, places] of Object.entries(LOCATIONS)) {
    const [low, high] = ARENA_LATITUDE[arena];
    for (const [name, x, y] of places) {
      if (!(low <= y - JITTER && y + JITTER < high)) {
        throw new Error(`${name} לא נמצא בפיקוד ${arena}`);
      }
    }
  }
}

function generateRandomAlert() {
  const arena = getRandomElement(ARENAS);
  const [place, x, y] = getRandomElement(LOCATIONS[arena]);

  return {
    displayName: `${getRandomElement(ALERT_NAMES)} – ${place}`,
    description: getRandomElement(DESCRIPTIONS),
    priority: getRandomElement(PRIORITIES),
    arena: arena,
    status: "Active",
    x: Number((x + getRandomFloat(-JITTER, JITTER)).toFixed(4)),
    y: Number((y + getRandomFloat(-JITTER, JITTER)).toFixed(4)),
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  checkLocations();

  console.log(`${CYAN}======================================================${RESET}`);
  console.log(`${CYAN}    🚨 Alert Simulator - מערכת סימולציה 🚨   ${RESET}`);
  console.log(`${CYAN}======================================================${RESET}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const port = await new Promise((resolve) => {
    rl.question(`הזן את הפורט עליו רץ השרת שלך [${YELLOW}3001${RESET}]: `, (answer) => {
      rl.close();
      resolve(answer.trim() || "3001");
    });
  });

  const targetUrl = `http://localhost:${port}/api/alerts`;

  console.log(`\n${CYAN}[INFO]${RESET} השרת מוגדר לכתובת: ${targetUrl}`);
  console.log(`${CYAN}[INFO]${RESET} הסימולטור ישלח התראות ברווחי זמן אקראיים (בין ${MIN_INTERVAL} ל-${MAX_INTERVAL} שניות).`);
  console.log(`${CYAN}[INFO]${RESET} להפסקת הסימולטור לחץ Ctrl+C.\n`);
  console.log("-".repeat(55));

  let alertCount = 0;

  // טיפול בעצירת התוכנית באמצעות Ctrl+C
  process.on("SIGINT", () => {
    console.log(`\n\n${CYAN}[INFO]${RESET} הסימולטור הופסק על ידי המשתמש. בהצלחה במבחן!`);
    process.exit(0);
  });

  while (true) {
    alertCount++;
    const payload = generateRandomAlert();
    const timestamp = new Date().toLocaleTimeString("he-IL", { hour12: false });

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(
          `[${timestamp}] #${alertCount} ${GREEN}[SUCCESS ${response.status}]${RESET} ` +
          `התראה נשלחה: '${payload.displayName}' | זירה: ${payload.arena} | דחיפות: ${payload.priority}`
        );
      } else {
        let reason = response.statusText;
        try {
          const details = await response.json();
          reason = details.message || reason;
          if (details.errors) {
            reason += ": " + Object.values(details.errors).join("; ");
          }
        } catch (_) {
          const text = await response.text();
          if (text) reason = text;
        }
        console.log(
          `[${timestamp}] #${alertCount} ${RED}[HTTP ERROR ${response.status}]${RESET} ` +
          `השרת דחה את הבקשה. סיבה: ${reason}`
        );
      }
    } catch (err) {
      if (err.cause && (err.cause.code === "ECONNREFUSED" || err.cause.code === "ENOTFOUND")) {
        console.log(
          `[${timestamp}] #${alertCount} ${YELLOW}[CONNECTION ERROR]${RESET} ` +
          `לא ניתן להתחבר ל-http://localhost:${port}. האם השרת למעלה?`
        );
      } else {
        console.log(`[${timestamp}] #${alertCount} ${RED}[ERROR]${RESET} שגיאה בלתי צפויה: ${err.message}`);
      }
    }

    // זמן המתנה אקראי בלולאה
    const sleepTimeSec = Number((getRandomFloat(MIN_INTERVAL, MAX_INTERVAL)).toFixed(1));
    await sleep(sleepTimeSec * 1000);
  }
}

main().catch((err) => {
  console.error(`${RED}[CRITICAL ERROR]${RESET} ${err.message}`);
  process.exit(1);
});