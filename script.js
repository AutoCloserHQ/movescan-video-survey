const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/xiftm74h14lucoevr7vn3jiuegym65gu";
const UPLOADCARE_PUBLIC_KEY = "0ff223f640764369dc2c";

const rooms = [
  {
    key: "living_room",
    label: "Living Room",
    caption: "Include sofas, sectionals, recliners, coffee tables, TV stands, lamps, decor, and visible boxes."
  },
  {
    key: "kitchen",
    label: "Kitchen",
    caption: "Include appliances, kitchen tables, stools, pantry items, small appliances, boxes, and visible cabinets/storage."
  },
  {
    key: "master_bedroom",
    label: "Master Bedroom",
    caption: "Include bed, mattress, dressers, nightstands, TV, mirrors, closet view, boxes, and storage items."
  },
  {
    key: "bedroom_1",
    label: "Bedroom 1",
    caption: "Include bed, dresser, nightstand, desk, closet view, boxes, toys, decor, and storage."
  },
  {
    key: "bedroom_2",
    label: "Bedroom 2",
    caption: "Include bed, dresser, nightstand, desk, closet view, boxes, toys, decor, and storage."
  },
  {
    key: "bedroom_3",
    label: "Bedroom 3",
    caption: "Include bed, dresser, nightstand, desk, closet view, boxes, toys, decor, and storage."
  },
  {
    key: "bedroom_4",
    label: "Bedroom 4",
    caption: "Optional — include this room if your home has an additional bedroom or guest room."
  },
  {
    key: "bedroom_5",
    label: "Bedroom 5",
    caption: "Optional — include this room if your home has an additional bedroom or guest room."
  },
  {
    key: "bedroom_6",
    label: "Bedroom 6",
    caption: "Optional — include this room if your home has an additional bedroom or guest room."
  },
  {
    key: "dining_room",
    label: "Dining Room",
    caption: "Include dining table, chairs, china cabinet, buffet, bar cart, rugs, artwork, and boxes."
  },
  {
    key: "garage_storage",
    label: "Garage / Storage",
    caption: "Include shelves, bins, tools, bikes, equipment, storage boxes, garage items, and bulky storage."
  },
  {
    key: "outdoor_patio",
    label: "Outdoor / Patio",
    caption: "Include patio furniture, grills, umbrellas, planters, outdoor storage, bikes, and yard items."
  },
  {
    key: "specialty_items",
    label: "Large / Specialty Items",
    caption: "Include pianos, safes, gym equipment, marble/glass pieces, oversized furniture, mirrors, artwork, antiques, aquariums, or fragile/heavy items."
  },
  {
    key: "other_room",
    label: "Other Room / Bonus Room",
    caption: "Include any office, den, playroom, nursery, guest room, loft, basement room, home gym, craft room, media room, hallway storage, or extra room."
  }
];

const roomUploads = document.getElementById("roomUploads");
const form = document.getElementById("videoSurveyForm");
const statusMessage = document.getElementById("statusMessage");
const clientCodeInput = document.getElementById("clientCode");

const pathParts = window.location.pathname.split("/").filter(Boolean);

// For GitHub Pages, path can be:
// /movescan-video-survey/
// /movescan-video-survey/aplus
// /movescan-video-survey/reliable
clientCodeInput.value = pathParts[1] || "default";

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
    const uploadInputs = document.querySelectorAll('[role="uploadcare-uploader"]');

    uploadInputs.forEach((input) => {
      uploadcare.Widget(input);
    });
  } else {
    statusMessage.className = "status error";
    statusMessage.textContent = "Upload widget failed to load. Please refresh the page.";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  statusMessage.className = "status";
  statusMessage.textContent = "Preparing your video survey...";
  form.querySelector("button").disabled = true;

  try {
    const formData = new FormData(form);
    const videos = [];

    rooms.forEach((room) => {
      const value = formData.get(room.key);

      if (value) {
        videos.push({
          room_key: room.key,
          room_label: room.label,
          video_url: value
        });
      }
    });

    if (videos.length === 0) {
      throw new Error("Please upload at least one room video before submitting.");
    }

    const payload = {
      client_code: formData.get("client_code"),
      survey_type: "Video",
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      move_date: formData.get("move_date"),
      from_zip: formData.get("from_zip"),
      to_zip: formData.get("to_zip"),
      videos: videos,
      submitted_at: new Date().toISOString()
    };

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Submission failed. Please try again.");
    }

    statusMessage.className = "status success";
    statusMessage.textContent = "Video survey submitted successfully. Thank you!";
    form.reset();

    setTimeout(() => {
      window.location.reload();
    }, 1200);
  } catch (error) {
    statusMessage.className = "status error";
    statusMessage.textContent = error.message;
  } finally {
    form.querySelector("button").disabled = false;
  }
});
