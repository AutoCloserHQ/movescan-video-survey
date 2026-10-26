const MAKE_WEBHOOK_URL =
  "https://hook.us2.make.com/gq2alys5xkdd8baoj5rfpq0brz2il3do";

const SUBMISSION_ALERT_URL =
  "https://movescan-video-frames.onrender.com/submission-alert";

const UPLOADCARE_PUBLIC_KEY = "0ff223f640764369dc2c";


const CLIENT_SETTINGS = {
  modelmoving: {
    companyName: "Model Moving",
    logo: "ModelMoving-Logo.png"
  },

  default: {
    companyName: "AutoCloser MoveScan",
    logo: "CC_20250926_175433.png"
  },

  aplus: {
    companyName: "A Plus Moving",
    logo: "AplusMoving.png"
  }

   txmoving: {
    companyName: "TX Moving & Storage",
    logo: "TX Moving NEW Logo.png"
  }
};

const rooms = [
  {
    key: "living_room",
    label: "Living Room",
    caption:
      "Include sofas, sectionals, recliners, coffee tables, TV stands, lamps, decor, and visible boxes."
  },
  {
    key: "kitchen",
    label: "Kitchen",
    caption:
      "Include appliances, kitchen tables, stools, pantry items, small appliances, boxes, and visible cabinets/storage."
  },
  {
    key: "master_bedroom",
    label: "Master Bedroom",
    caption:
      "Include bed, mattress, dressers, nightstands, TV, mirrors, closet view, boxes, and storage items."
  },
  {
    key: "bedroom_1",
    label: "Bedroom 1",
    caption:
      "Include bed, dresser, nightstand, desk, closet view, boxes, toys, decor, and storage."
  },
  {
    key: "bedroom_2",
    label: "Bedroom 2",
    caption:
      "Include bed, dresser, nightstand, desk, closet view, boxes, toys, decor, and storage."
  },
  {
    key: "bedroom_3",
    label: "Bedroom 3",
    caption:
      "Include bed, dresser, nightstand, desk, closet view, boxes, toys, decor, and storage."
  },
  {
    key: "bedroom_4",
    label: "Bedroom 4",
    caption:
      "Optional — include this room if your home has an additional bedroom or guest room."
  },
  {
    key: "bedroom_5",
    label: "Bedroom 5",
    caption:
      "Optional — include this room if your home has an additional bedroom or guest room."
  },
  {
    key: "bedroom_6",
    label: "Bedroom 6",
    caption:
      "Optional — include this room if your home has an additional bedroom or guest room."
  },
  {
    key: "dining_room",
    label: "Dining Room",
    caption:
      "Include dining table, chairs, china cabinet, buffet, bar cart, rugs, artwork, and boxes."
  },
  {
    key: "garage_storage",
    label: "Garage / Storage",
    caption:
      "Include shelves, bins, tools, bikes, equipment, storage boxes, garage items, and bulky storage."
  },
  {
    key: "outdoor_patio",
    label: "Outdoor / Patio",
    caption:
      "Include patio furniture, grills, umbrellas, planters, outdoor storage, bikes, and yard items."
  },
  {
    key: "other_room",
    label: "Other Room / Bonus Room",
    caption:
      "Include any office, den, playroom, nursery, guest room, loft, basement room, home gym, craft room, media room, hallway storage, or extra room."
  }
];


const roomUploads = document.getElementById("roomUploads");
const form = document.getElementById("videoSurveyForm");
const statusMessage = document.getElementById("statusMessage");
const clientCodeInput = document.getElementById("clientCode");


function getClientCode() {
  const urlParams = new URLSearchParams(
    window.location.search
  );

  const queryClientCode =
    urlParams.get("client_code");

  if (queryClientCode) {
    return queryClientCode
      .trim()
      .toLowerCase();
  }

  const pathParts = window.location.pathname
    .split("/")
    .filter(Boolean);

  if (pathParts[0] === "movescan-video-survey") {
    return (
      pathParts[1] || "default"
    )
      .trim()
      .toLowerCase();
  }

  return (
    pathParts[0] || "default"
  )
    .trim()
    .toLowerCase();
}


function applyClientBranding() {
  const clientCode = getClientCode();

  const settings =
    CLIENT_SETTINGS[clientCode] ||
    CLIENT_SETTINGS.default;

  const brandLogo =
    document.getElementById("brandLogo");

  if (brandLogo) {
    brandLogo.src = settings.logo;
    brandLogo.alt = settings.companyName;
  }
}


clientCodeInput.value = getClientCode();
applyClientBranding();


rooms.forEach((room) => {
  const card = document.createElement("div");

  card.className = "room-card";

  card.innerHTML = `
    <h3>${room.label}</h3>

    <p>${room.caption}</p>

    <input
      type="hidden"
      role="uploadcare-uploader"
      name="${room.key}"
      data-public-key="${UPLOADCARE_PUBLIC_KEY}"
      data-tabs="file camera"
      data-preview-step="true"
      data-images-only="false"
      data-input-accept-types="video/*"
    />
  `;

  roomUploads.appendChild(card);
});


window.addEventListener("load", () => {
  if (window.uploadcare) {
    const uploadInputs =
      document.querySelectorAll(
        '[role="uploadcare-uploader"]'
      );

    uploadInputs.forEach((input) => {
      uploadcare.Widget(input);
    });
  } else {
    statusMessage.className =
      "status error";

    statusMessage.textContent =
      "Upload widget failed to load. Please refresh the page.";
  }
});


async function sendToMake(payload) {
  const response = await fetch(
    MAKE_WEBHOOK_URL,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new Error(
      "Your video survey could not be saved. Please try again."
    );
  }

  return response;
}


async function sendSubmissionAlert(payload) {
  try {
    const response = await fetch(
      SUBMISSION_ALERT_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const responseText =
        await response.text();

      console.error(
        "MoveScan alert failed:",
        response.status,
        responseText
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "MoveScan alert request failed:",
      error
    );

    return false;
  }
}


form.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const submitButton =
      form.querySelector(
        'button[type="submit"]'
      );

    statusMessage.className = "status";

    statusMessage.textContent =
      "Submitting your video survey. Please wait...";

    submitButton.disabled = true;

    try {
      const formData =
        new FormData(form);

      const videos = [];

      rooms.forEach((room) => {
        const value =
          formData.get(room.key);

        if (value) {
          videos.push({
            room_key: room.key,
            room_label: room.label,
            video_url: value
          });
        }
      });

      if (videos.length === 0) {
        throw new Error(
          "Please upload at least one room video before submitting."
        );
      }

      const payload = {
        client_code:
          formData.get("client_code"),

        survey_type: "Video",

        name:
          formData.get("name"),

        email:
          formData.get("email"),

        phone:
          formData.get("phone"),

        move_date:
          formData.get("move_date"),

        from_zip:
          formData.get("from_zip"),

        to_zip:
          formData.get("to_zip"),

        videos: videos,

        submitted_at:
          new Date().toISOString(),

        page_url:
          window.location.href
      };

      /*
       * First, safely deliver the full submission
       * into the Make webhook queue.
       *
       * The client does not receive success unless
       * Make confirms that it received the payload.
       */
      await sendToMake(payload);

      statusMessage.textContent =
        "Video survey received. Finalizing submission...";

      /*
       * Next, ask Render to email Derrick.
       *
       * An email failure does not erase or reject
       * the customer's saved Make submission.
       */
      const alertSent =
        await sendSubmissionAlert(payload);

      if (!alertSent) {
        console.warn(
          "Submission was saved in Make, but the email alert was not sent."
        );
      }

      statusMessage.className =
        "status success";

      statusMessage.textContent =
        "Video survey submitted successfully. Thank you!";

      form.reset();

      clientCodeInput.value =
        getClientCode();

      setTimeout(() => {
        window.location.reload();
      }, 1800);

    } catch (error) {
      console.error(
        "MoveScan submission error:",
        error
      );

      statusMessage.className =
        "status error";

      statusMessage.textContent =
        error.message ||
        "Submission failed. Please try again.";

    } finally {
      submitButton.disabled = false;
    }
  }
);
