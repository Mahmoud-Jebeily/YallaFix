/*
const technicians = [
    {
        name: "Ali Hassan",
        task: "Plumbing",
        phone: "123-456-7890",
        experience: "Beginner",
        priceRange: "$",
        profilePic: "images/default_pfp.png"
    },
    {
        name: "Sara Ahmed",
        task: "Electrical",
        phone: "987-654-3210",
        experience: "Expert",
        priceRange: "$$$$",
        profilePic: "images/default_pfp.png"
    },
    {
        name: "John Smith",
        task: "Carpentry",
        phone: "555-123-4567",
        experience: "Intermediate",
        priceRange: "$$$",
        profilePic: "images/default_pfp.png"
    },
    {
        name: "Emma Jones",
        task: "HVAC Repair",
        phone: "333-789-4561",
        experience: "Beginner",
        priceRange: "$$",
        profilePic: "images/default_pfp.png"
    }
];
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
      
        const firebaseConfig = {
            apiKey: "AIzaSyAZlaYBlGK1pT6ug_4JfLYNE3uLEuh7U7o",
            authDomain: "yallafix-8586f.firebaseapp.com",
            projectId: "yallafix-8586f",
            storageBucket: "yallafix-8586f.firebasestorage.app",
            messagingSenderId: "68556947912",
            appId: "1:68556947912:web:8d07a7c75d1652f81d00fd",
            measurementId: "G-E2BJQZQWGD"
        };
      
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
      
        const service = localStorage.getItem("selectedService");

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const uid = user.uid;
                try {
                    const res = await fetch(`https://yallafix1.onrender.com/findTechnicians?uid=${uid}&service=${encodeURIComponent(service)}`);
                    if (!res.ok) throw new Error("Failed to fetch technicians");
                    const technicians = await res.json();
                    displayTechnicians(technicians);
                } catch (err) {
                    console.error("Error loading technicians:", err);
                    showToast("Failed to load technicians.");
                }
            } else {
                showToast("You must be logged in to find a technician.");
                window.location.href = "login.html";
            }
        });

function displayTechnicians(technicians) {
    const technicianList = document.getElementById("technicianList");
    technicianList.innerHTML = "";

    technicians.forEach(technician => {
        const priceRange = formatPriceRange(technician.min_price, technician.max_price);
        const techDiv = document.createElement("div");
        techDiv.className = "technician-card";
        techDiv.innerHTML = `
            <div class="card-content">
                <img src="${technician.profile_picture || 'images/default_pfp.png'}" alt="${technician.name}" class="technician-img" />
                <div class="technician-info">
                    <h3>${technician.name}</h3>
                    <p><strong>${technician.task}</strong></p>
                    <p><strong>Phone:</strong> ${technician.phone}</p>
                    <p><strong>Experience:</strong> ${technician.experience}</p>
                    <p><strong>Price:</strong> ${priceRange}</p>
                </div>
            </div>
            <div class="contact-buttons" style="display: none;">
                <a href="tel:${technician.phone}" class="contact-btn phone-btn">Contact by Phone</a>
                <a href="sms:${technician.phone}" class="contact-btn sms-btn">Contact by SMS</a>
            </div>
            <div class="start-btn-container" style="display: none;">
                <button class="start-service-btn">Start Service</button>
            </div>
        `;

        const contactBtnsContainer = techDiv.querySelector(".contact-buttons");
        const contactPhoneBtn = techDiv.querySelector(".phone-btn");
        const contactSmsBtn = techDiv.querySelector(".sms-btn");
        const startBtnContainer = techDiv.querySelector(".start-btn-container");
        const startBtn = techDiv.querySelector(".start-service-btn");

        techDiv.addEventListener("click", () => {
            contactBtnsContainer.style.display = "flex";
        });

        [contactPhoneBtn, contactSmsBtn].forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                contactBtnsContainer.style.display = "none";
                startBtnContainer.style.display = "flex";
            });
        });


        // Handle request submission
        startBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const customerName = "John Doe"; // Replace with dynamic customer name if available
            const task = technician.task;
            const techName = technician.name;
            const techID = technician.firebase_uid;

            const user = auth.currentUser; // Get the current user
            if (!user) {
                showToast("You must be logged in to request a service.");
                return;
            }
            const customerID = user.uid; // Firebase UID of the current user (customer)

            const now = new Date();

            // Create the new appointment object
            const newAppointment = {
                DateAndTime: toMySQLDatetime(now),
                Status: "Pending",
                CustomerID: customerID,
                TechnicianID: techID,
                Service: task,
            };

            try {
                const response = await fetch('https://yallafix1.onrender.com/api/create_appointment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newAppointment),
                });

                if (response.ok) {
                    showToast(`Request sent to ${technician.name}`);
                    contactBtnsContainer.style.display = "none";
                } else {
                    showToast("Failed to send request. Please try again.");
                }
                } catch (err) {
                    console.error("Error sending appointment request:", err);
                    showToast("Failed to send request. Please try again.");
                }
            
            const newRequest = {
                id: Date.now().toString(),
                customerName,
                task,
                techName,
                status: "Pending",
            };

            // Send the request to the server
            const response = await fetch('https://yallafix1.onrender.com/api/service-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRequest),
            });

            if (response.ok) {
                showToast(`Request sent to ${technician.name}`);
                contactBtnsContainer.style.display = "none";
            } else {
                showToast("Failed to send request. Please try again.");
            }
            


            loadCustomerHistory(); 
            loadTechHistory();
            
        });


        //startBtn.addEventListener("click", (e) => {
        //   e.stopPropagation();
        //  window.location.href = "service-loading.html";
        //  });


        technicianList.appendChild(techDiv);
    });
}

function formatPriceRange(min, max) {
    const minInt = parseInt(min);
    const maxInt = parseInt(max);
    if (isNaN(minInt) || isNaN(maxInt)) return "$";
    const avg = (minInt + maxInt) / 2;
    if (avg < 50) return "$";
    if (avg < 150) return "$$";
    if (avg < 300) return "$$$";
    return "$$$$";
}

function toMySQLDatetime(date) {
    const pad = n => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function showToast(message) {
    const toastEl = document.getElementById('myToast');
    const toastBody = toastEl.querySelector('.toast-body');
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}
document.querySelector('#myToast .btn-close').addEventListener('click', () => {
    document.getElementById('myToast').classList.remove('show');
});


