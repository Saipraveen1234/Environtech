(function ($) {
  "use strict";

  // Failsafe spinner removal - works even without jQuery
  function hideSpinner() {
    const spinner = document.getElementById("spinner");
    if (spinner) {
      spinner.classList.remove("show");
      spinner.style.display = "none";
    }
  }

  // Spinner with multiple fallbacks
  var spinner = function () {
    setTimeout(function () {
      try {
        if ($ && $("#spinner").length > 0) {
          $("#spinner").removeClass("show");
        } else {
          hideSpinner();
        }
      } catch (e) {
        hideSpinner();
      }
    }, 1);
  };

  // Hide spinner immediately and after short delay as backup
  hideSpinner();
  spinner();

  // Additional failsafe after 2 seconds
  setTimeout(hideSpinner, 2000);

  // Initiate the wowjs only if available
  try {
    if (typeof WOW !== "undefined") {
      new WOW().init();
    }
  } catch (e) {
    console.log("WOW.js not available");
  }

  // Sticky Navbar
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".sticky-top").addClass("shadow-sm").css("top", "0px");
    } else {
      $(".sticky-top").removeClass("shadow-sm").css("top", "-100px");
    }
  });

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  });
  $(".back-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 600, "easeInOutExpo");
    return false;
  });

  // Facts counter
  $('[data-toggle="counter-up"]').counterUp({
    delay: 10,
    time: 2000,
  });

  // Header carousel
  $(".header-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1500,
    loop: true,
    nav: false,
    dots: true,
    items: 1,
    dotsData: true,
  });

  // Testimonials carousel
  $(".testimonial-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1000,
    center: true,
    dots: false,
    loop: true,
    nav: true,
    navText: [
      '<i class="bi bi-arrow-left"></i>',
      '<i class="bi bi-arrow-right"></i>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 2,
      },
    },
  });

  // Portfolio isotope and filter
  var portfolioIsotope = $(".portfolio-container").isotope({
    itemSelector: ".portfolio-item",
    layoutMode: "fitRows",
  });
  $("#portfolio-flters li").on("click", function () {
    $("#portfolio-flters li").removeClass("active");
    $(this).addClass("active");
    portfolioIsotope.isotope({ filter: $(this).data("filter") });
  });

  // Mobile Navigation
  $(".mobile-menu-btn").click(function () {
    $(this).toggleClass("active");
    $(".nav-menu").toggleClass("active");
    $("body").toggleClass("menu-open");
  });

  // Close mobile menu when clicking on nav links
  $(".nav-link").click(function () {
    $(".mobile-menu-btn").removeClass("active");
    $(".nav-menu").removeClass("active");
    $("body").removeClass("menu-open");
  });

  // Close mobile menu when clicking outside
  $(document).click(function (e) {
    if (!$(e.target).closest(".header").length) {
      $(".mobile-menu-btn").removeClass("active");
      $(".nav-menu").removeClass("active");
      $("body").removeClass("menu-open");
    }
  });

  // Smooth scrolling for navigation links
  $('.nav-link[href^="#"]').on("click", function (e) {
    e.preventDefault();
    var target = $($(this).attr("href"));
    if (target.length) {
      $("html, body").animate(
        {
          scrollTop: target.offset().top - 100,
        },
        500
      );
    }
  });

  // Header scroll behavior for mobile
  $(window).scroll(function () {
    var scroll = $(window).scrollTop();
    if (scroll >= 50) {
      $(".header").addClass("scrolled");
    } else {
      $(".header").removeClass("scrolled");
    }
  });

  // Solar Calculator Constants
  const UNITS_PER_KW = 1440; // Annual units generated per kW
  const SPACE_PER_KW = 80; // Space required per kW in sqft
  const SAVINGS_PER_KW = 10080; // Annual savings per kW in ₹
  const BASE_SUBSIDY = 30000; // Base subsidy amount in ₹
  const SUBSIDY_PER_KW = 30000; // Subsidy per kW in ₹ (30% of price per kW)
  const BILL_TO_KW_FACTOR = 700; // Monthly bill amount that approximately equals 1 kW requirement
  const CO2_SAVED_PER_KW = 1200; // CO2 saved per kW per year in kg
  const TREES_PER_KW = 15; // Trees equivalent per kW

  // Default location factor (average across India)
  const DEFAULT_LOCATION_FACTOR = 1.0;

  // Pricing structure matching your calculator values
  function calculateSystemPrice(systemSize) {
    if (systemSize <= 0) return 0;

    // Exact pricing to match your calculator
    if (systemSize <= 1) {
      return Math.round(systemSize * 98769);
    } else if (systemSize <= 10) {
      // Linear interpolation between 1kW (₹98,769) and 10kW (₹5,60,051)
      const priceAt1kW = 98769;
      const priceAt10kW = 560051;
      const slope = (priceAt10kW - priceAt1kW) / (10 - 1);
      return Math.round(priceAt1kW + slope * (systemSize - 1));
    } else {
      // For systems larger than 10kW, use 10kW rate per additional kW
      const basePriceAt10kW = 560051;
      const additionalKW = systemSize - 10;
      const ratePerKWAbove10 = 56005; // ₹56,005 per kW for systems above 10kW
      return Math.round(basePriceAt10kW + additionalKW * ratePerKWAbove10);
    }
  }

  // Subsidy calculation based on system size (PM Surya Ghar Muft Bijli Yojana)
  function calculateSubsidy(systemSize, category) {
    if (category === "Commercial") {
      return 0; // No subsidy for commercial
    }

    let subsidy = 0;
    if (systemSize <= 1) {
      subsidy = systemSize * 30000; // ₹30,000 per kW up to 1 kW
    } else if (systemSize <= 2) {
      subsidy = 30000 + (systemSize - 1) * 30000; // ₹30,000 per kW up to 2 kW
    } else if (systemSize <= 3) {
      subsidy = 60000 + (systemSize - 2) * 18000; // ₹18,000 per kW from 2-3 kW
    } else {
      subsidy = 78000; // Maximum subsidy is ₹78,000
    }

    return Math.min(subsidy, 78000);
  }

  // Calculator Functions
  function updateCalculatorResults(systemSize) {
    const category = $("#solar-purpose").val();

    // Use default location factor
    const locationFactor = DEFAULT_LOCATION_FACTOR;

    // Add loading state
    $(".result-card").addClass("loading");

    // Calculate results with location-based adjustments
    const spaceRequired = systemSize * SPACE_PER_KW;
    const annualEnergy = Math.round(systemSize * UNITS_PER_KW * locationFactor);
    const annualSavings = Math.round(
      systemSize * SAVINGS_PER_KW * locationFactor
    );
    const price = calculateSystemPrice(systemSize);
    const subsidy = calculateSubsidy(systemSize, category);

    // Simulate calculation delay for better UX
    setTimeout(() => {
      // Remove loading state and add updating animation
      $(".result-card").removeClass("loading");
      $(".result-card p").addClass("updating");

      // Update UI with formatted numbers
      $("#system-size").text(`${systemSize.toFixed(1)} kW`);
      $("#space-required").text(`${Math.round(spaceRequired)} sqft`);
      $("#energy-generated").text(`${annualEnergy.toLocaleString()} Units`);
      $("#annual-savings").text(`₹ ${annualSavings.toLocaleString()}`);

      // Show/hide price and subsidy cards based on system size
      if (systemSize > 10) {
        // Hide price and subsidy for systems above 10kW (like Freyr Energy)
        $("#price-excluding-subsidy").closest(".result-card").hide();
        $("#subsidy").closest(".result-card").hide();
        // Adjust grid for 4 cards (2x2 layout)
        $(".results-grid").css("grid-template-columns", "repeat(2, 1fr)");
      } else {
        // Show price and subsidy for systems 10kW and below
        $("#price-excluding-subsidy").closest(".result-card").show();
        $("#subsidy").closest(".result-card").show();
        $("#price-excluding-subsidy").text(`₹ ${price.toLocaleString()}`);
        $("#subsidy").text(`₹ ${subsidy.toLocaleString()}`);
        // Adjust grid for 6 cards (2x3 layout)
        $(".results-grid").css("grid-template-columns", "repeat(2, 1fr)");
      }

      // Remove updating animation after it completes
      setTimeout(() => {
        $(".result-card p").removeClass("updating");
      }, 600);
    }, 500);
  }

  function calculateFromMonthlyBill(monthlyBill) {
    const locationFactor = DEFAULT_LOCATION_FACTOR;

    // Adjust calculation based on location
    const adjustedFactor = BILL_TO_KW_FACTOR / locationFactor;
    const estimatedSystemSize = monthlyBill / adjustedFactor;
    updateCalculatorResults(estimatedSystemSize);
  }

  function handleSystemSizeInput() {
    const systemSize = parseFloat($("#system-size-input").val()) || 0;
    updateCalculatorResults(Math.max(0, systemSize));
  }

  function handleMonthlyBillInput() {
    const monthlyBill = parseFloat($("#monthly-bill").val()) || 0;
    calculateFromMonthlyBill(Math.max(0, monthlyBill));
  }

  function initializeCalculator() {
    // Cache DOM elements
    const systemSizeSection = $("#system-size-section");
    const monthlyBillSection = $("#monthly-bill-section");
    const toggleLink = $("#toggle-calculation-method");
    const systemSizeInput = $("#system-size-input");
    const monthlyBillInput = $("#monthly-bill");

    // Set default state (Monthly bill mode)
    systemSizeSection.hide();
    monthlyBillSection.show();
    monthlyBillInput.val(2500);
    calculateFromMonthlyBill(2500);

    // Toggle between calculation methods
    let isMonthlyBillMode = true;

    toggleLink.on("click", function (e) {
      e.preventDefault();

      if (isMonthlyBillMode) {
        // Switch to System Size mode
        systemSizeSection.show();
        monthlyBillSection.hide();
        toggleLink.text("Or calculate savings using Monthly Bill");
        handleSystemSizeInput();
        isMonthlyBillMode = false;
      } else {
        // Switch to Monthly Bill mode
        systemSizeSection.hide();
        monthlyBillSection.show();
        toggleLink.text("Or calculate savings using System size(kW)");
        handleMonthlyBillInput();
        isMonthlyBillMode = true;
      }
    });

    // Input handlers
    systemSizeInput.on("input", handleSystemSizeInput);
    monthlyBillInput.on("input", handleMonthlyBillInput);
    $("#solar-purpose").on("change", function () {
      if (monthlyBillSection.is(":visible")) {
        handleMonthlyBillInput();
      } else {
        handleSystemSizeInput();
      }
    });

    // Button Handlers
    $("#get-quote").on("click", function () {
      openQuoteModal();
    });
  }

  // Initialize Calculator when document is ready
  $(document).ready(function () {
    initializeCalculator();
    initializeSchemeNavigation();
    initializeCalculatorAnimations();
  });

  // Enhanced Calculator Animations
  function initializeCalculatorAnimations() {
    // Add hover effects for input groups
    $(".input-group").on("mouseenter", function () {
      $(this).find("::before").css("left", "100%");
    });

    // Add click animation for buttons
    $(".calculator-actions .btn").on("click", function (e) {
      const button = $(this);
      const ripple = $('<span class="ripple"></span>');

      button.append(ripple);
      ripple.css({
        left: e.offsetX + "px",
        top: e.offsetY + "px",
      });

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });

    // Add tooltip functionality
    $(".result-card[data-tooltip]")
      .on("mouseenter", function () {
        const tooltip = $(this).attr("data-tooltip");
        const tooltipEl = $(`<div class="tooltip">${tooltip}</div>`);

        $("body").append(tooltipEl);

        const rect = this.getBoundingClientRect();
        tooltipEl.css({
          position: "absolute",
          top: rect.top - 40 + "px",
          left: rect.left + rect.width / 2 - tooltipEl.width() / 2 + "px",
          zIndex: 1000,
        });
      })
      .on("mouseleave", function () {
        $(".tooltip").remove();
      });
  }

  // Mobile Navigation
  $(".mobile-menu-btn").click(function () {
    $(this).toggleClass("active");
    $(".nav-menu").toggleClass("active");
    $("body").toggleClass("menu-open");
  });

  // Close mobile menu when clicking on nav links
  $(".nav-link").click(function () {
    $(".mobile-menu-btn").removeClass("active");
    $(".nav-menu").removeClass("active");
    $("body").removeClass("menu-open");
  });

  // Close mobile menu when clicking outside
  $(document).click(function (e) {
    if (!$(e.target).closest(".header").length) {
      $(".mobile-menu-btn").removeClass("active");
      $(".nav-menu").removeClass("active");
      $("body").removeClass("menu-open");
    }
  });

  // Smooth scrolling for navigation links
  $('.nav-link[href^="#"]').on("click", function (e) {
    e.preventDefault();
    var target = $($(this).attr("href"));
    if (target.length) {
      $("html, body").animate(
        {
          scrollTop: target.offset().top - 100,
        },
        500
      );
    }
  });

  // Header scroll behavior for mobile
  $(window).scroll(function () {
    var scroll = $(window).scrollTop();
    if (scroll >= 50) {
      $(".header").addClass("scrolled");
    } else {
      $(".header").removeClass("scrolled");
    }
  });

  // Testimonials carousel mobile optimization

  // Solar Purpose Change Handler
  $("#solar-purpose").on("change", function () {
    const purpose = $(this).val();
    let hint = "";

    switch (purpose) {
      case "Home":
        hint = "Recommended size: 1-10 kW";
        break;
      case "Business":
        hint = "Recommended size: 10-100 kW";
        break;
      case "Agriculture":
        hint = "Recommended size: 5-50 kW";
        break;
    }

    // Update hint text if you have a hint element
    $("#size-hint").text(hint);
  });

  // Enhanced validation for number inputs
  $('input[type="number"]').on("input", function () {
    let value = parseFloat($(this).val());
    const min = parseFloat($(this).attr("min")) || 0;

    if (isNaN(value) || value < min) {
      $(this).val(min);
    }
  });

  // Scheme Navigation
  function initializeSchemeNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".col-12[id], .col-md-6[id]");

    // Function to handle navigation
    function handleNavigation(targetId) {
      // Update active state
      navItems.forEach((item) => {
        item.classList.remove("active");
        if (item.dataset.target === targetId) {
          item.classList.add("active");
        }
      });

      // Scroll to section
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 100,
          behavior: "smooth",
        });
      }
    }

    // Add click event listeners
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        handleNavigation(item.dataset.target);
      });
    });

    // Add scroll event listener for highlighting current section
    window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY + 200;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.id;

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          navItems.forEach((item) => {
            item.classList.remove("active");
            if (item.dataset.target === sectionId) {
              item.classList.add("active");
            }
          });
        }
      });
    });
  }

  // Header Functionality
  document.addEventListener("DOMContentLoaded", function () {
    const header = document.querySelector(".header");
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    // Header scroll effect
    window.addEventListener("scroll", function () {
      const scrollY = window.scrollY;

      if (scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });

    // Mobile menu toggle with improved handling
    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        this.classList.toggle("active");
        navMenu.classList.toggle("active");

        // Prevent body scrolling when menu is open
        if (navMenu.classList.contains("active")) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "";
        }

        console.log(
          "Mobile menu toggled:",
          navMenu.classList.contains("active")
        );
      });
    }

    // Close mobile menu when clicking a link
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenuBtn.classList.remove("active");
        navMenu.classList.remove("active");
        document.body.style.overflow = ""; // Restore body scrolling
      });
    });

    // Logo click to scroll to top
    const logoImg = document.querySelector(".logo-img");
    if (logoImg) {
      logoImg.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    }

    // Close mobile menu when clicking outside or pressing escape
    document.addEventListener("click", function (e) {
      if (!header.contains(e.target) && navMenu.classList.contains("active")) {
        mobileMenuBtn.classList.remove("active");
        navMenu.classList.remove("active");
        document.body.style.overflow = ""; // Restore body scrolling
      }
    });

    // Close menu on escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMenu.classList.contains("active")) {
        mobileMenuBtn.classList.remove("active");
        navMenu.classList.remove("active");
        document.body.style.overflow = "";
      }
    });

    // Active link highlighting
    function setActiveLink() {
      const sections = document.querySelectorAll("section[id]");
      const scrollY = window.pageYOffset;

      sections.forEach((section) => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 120;
        const sectionId = section.getAttribute("id");

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          document
            .querySelector(".nav-link[href*=" + sectionId + "]")
            ?.classList.add("active");
        } else {
          document
            .querySelector(".nav-link[href*=" + sectionId + "]")
            ?.classList.remove("active");
        }
      });
    }

    window.addEventListener("scroll", setActiveLink);
  });

  // Quote Modal Functions
  function openQuoteModal() {
    // Get current calculator values
    const systemSize = $("#system-size").text();
    const energyGenerated = $("#energy-generated").text();
    const annualSavings = $("#annual-savings").text();
    const price = $("#price-excluding-subsidy").text();
    const subsidy = $("#subsidy").text();

    // Populate modal with calculator values
    $("#quote-system-size").text(systemSize);
    $("#quote-energy").text(energyGenerated);
    $("#quote-savings").text(annualSavings);
    $("#quote-price").text(price);
    $("#quote-subsidy").text(subsidy);

    // Get current system size as number to check if > 10kW
    const systemSizeNum = parseFloat(systemSize);

    // Show/hide price and subsidy items based on system size (same logic as calculator)
    if (systemSizeNum > 10) {
      $("#quote-price-item").hide();
      $("#quote-subsidy-item").hide();
    } else {
      $("#quote-price-item").show();
      $("#quote-subsidy-item").show();
    }

    // Pre-fill monthly bill if available
    const monthlyBill = $("#monthly-bill").val();
    if (monthlyBill) {
      $("#quote-monthly-bill").val(monthlyBill);
    }

    // Show modal
    $("#quoteModal").addClass("active").show();
    $("body").css("overflow", "hidden"); // Prevent background scrolling
  }

  function closeQuoteModal() {
    $("#quoteModal").removeClass("active");
    setTimeout(() => {
      $("#quoteModal").hide();
      $("body").css("overflow", "auto"); // Restore scrolling
    }, 300);
  }

  /*
    ====================================================================
    EMAILJS SETUP INSTRUCTIONS
    ====================================================================

    Follow these steps to set up EmailJS for sending quote requests:

    1. CREATE EMAILJS ACCOUNT:
       - Go to https://www.emailjs.com/
       - Sign up for a free account (allows 200 emails/month)

    2. ADD EMAIL SERVICE:
       - In EmailJS dashboard, go to "Email Services"
       - Click "Add New Service"
       - Choose your email provider (Gmail, Outlook, etc.)
       - Follow the setup instructions
       - Note down the SERVICE ID (e.g., 'service_abc123')

    3. CREATE EMAIL TEMPLATE:
       - Go to "Email Templates"
       - Click "Create New Template"
       - Use this template structure:

       Subject: New Solar Quote Request - {{customer_name}}

       Template Content:
       ==================
       NEW SOLAR QUOTE REQUEST

       Customer Information:
       - Name: {{customer_name}}
       - Email: {{customer_email}}
       - Phone: {{customer_phone}}
       - City: {{customer_city}}
       - Address: {{customer_address}}
       - Roof Type: {{roof_type}}
       - Property Type: {{property_type}}
       - Monthly Bill: ₹{{monthly_bill}}
       - Installation Timeline: {{installation_timeline}}
       - Additional Notes: {{customer_notes}}

       Solar System Details:
       - System Size: {{system_size}}
       - Annual Energy Generated: {{annual_energy}}
       - Annual Savings: {{annual_savings}}
       - Total Cost: {{total_cost}}
       - Government Subsidy: {{government_subsidy}}

       Form Details:
       - Submission Date: {{submission_date}}
       - Form Type: {{form_type}}

       Please contact the customer within 24 hours.
       ==================

       - Save the template and note the TEMPLATE ID (e.g., 'template_xyz789')

    4. GET PUBLIC KEY:
       - Go to "Account" > "General"
       - Copy your Public Key (e.g., 'user_abc123def456')

    5. UPDATE CONFIGURATION:
       - Replace the values below with your actual IDs
       - Test the form to ensure emails are being sent

    6. OPTIONAL - AUTO-REPLY:
       - Create a second template for customer confirmation
       - Send auto-reply to customer_email

    ====================================================================
    */

  // EmailJS Configuration
  const EMAIL_CONFIG = {
    serviceID: "YOUR_SERVICE_ID", // Replace with your EmailJS service ID
    templateID: "YOUR_TEMPLATE_ID", // Replace with your EmailJS template ID
    publicKey: "YOUR_PUBLIC_KEY", // Replace with your EmailJS public key
  };

  // Initialize EmailJS
  function initializeEmailJS() {
    if (typeof emailjs !== "undefined") {
      emailjs.init(EMAIL_CONFIG.publicKey);
    } else {
      console.error("EmailJS library not loaded");
    }
  }

  // Quote form submission
  function handleQuoteFormSubmission() {
    $("#quoteForm").on("submit", function (e) {
      e.preventDefault();

      // Get form data
      const formData = {
        // System Details
        systemSize: $("#quote-system-size").text(),
        annualEnergy: $("#quote-energy").text(),
        annualSavings: $("#quote-savings").text(),
        totalCost: $("#quote-price").text(),
        subsidy: $("#quote-subsidy").text(),

        // Contact Information
        name: $("#quote-name").val(),
        email: $("#quote-email").val(),
        phone: $("#quote-phone").val(),
        city: $("#quote-city").val(),
        address: $("#quote-address").val(),
        roofType: $("#quote-roof-type").val(),
        propertyType: $("#quote-property-type").val(),
        monthlyBill: $("#quote-monthly-bill").val(),
        timeline: $("#quote-timeline").val(),
        notes: $("#quote-notes").val(),
      };

      // Basic validation
      if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.city
      ) {
        alert("Please fill in all required fields (marked with *)");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert("Please enter a valid email address");
        return;
      }

      // Phone validation (basic)
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
        alert("Please enter a valid 10-digit phone number");
        return;
      }

      // Show loading state
      $(".btn-submit")
        .html('<i class="fas fa-spinner fa-spin"></i> Submitting...')
        .prop("disabled", true);

      // Send email using EmailJS
      sendQuoteEmail(formData);
    });
  }

  // Send email using EmailJS
  function sendQuoteEmail(formData) {
    // Check if EmailJS is configured
    if (EMAIL_CONFIG.serviceID === "YOUR_SERVICE_ID") {
      // Show configuration message if not set up
      setTimeout(() => {
        alert(
          `EmailJS Configuration Required!\n\nPlease set up EmailJS by:\n1. Creating an account at emailjs.com\n2. Replacing the configuration values in main.js\n3. Creating an email template\n\nFor now, showing form data:\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nCity: ${formData.city}\nSystem Size: ${formData.systemSize}\nAnnual Savings: ${formData.annualSavings}`
        );

        // Reset form and close modal
        $("#quoteForm")[0].reset();
        closeQuoteModal();

        // Reset button
        $(".btn-submit")
          .html('<i class="fas fa-paper-plane"></i> Get Free Quote')
          .prop("disabled", false);

        console.log("Quote request data:", formData);
      }, 1000);
      return;
    }

    // Prepare email template parameters
    const templateParams = {
      // Customer Information
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      customer_city: formData.city,
      customer_address: formData.address || "Not provided",
      roof_type: formData.roofType || "Not specified",
      property_type: formData.propertyType || "Not specified",
      monthly_bill: formData.monthlyBill || "Not provided",
      installation_timeline: formData.timeline || "Not specified",
      customer_notes: formData.notes || "No additional notes",

      // Solar System Details
      system_size: formData.systemSize,
      annual_energy: formData.annualEnergy,
      annual_savings: formData.annualSavings,
      total_cost: formData.totalCost,
      government_subsidy: formData.subsidy,

      // Additional Info
      submission_date: new Date().toLocaleString(),
      form_type: "Solar Quote Request",
    };

    // Send email
    emailjs
      .send(EMAIL_CONFIG.serviceID, EMAIL_CONFIG.templateID, templateParams)
      .then(
        function (response) {
          console.log("Email sent successfully:", response);

          // Success message
          alert(
            `Thank you ${formData.name}! Your quote request has been submitted successfully.\n\nOur solar experts will contact you within 24 hours at ${formData.phone}.\n\nSystem Details:\n• Size: ${formData.systemSize}\n• Annual Savings: ${formData.annualSavings}\n\nWe'll provide a detailed site assessment and customized proposal for your property.`
          );

          // Reset form and close modal
          $("#quoteForm")[0].reset();
          closeQuoteModal();
        },
        function (error) {
          console.error("Email sending failed:", error);

          // Error message
          alert(
            "Sorry, there was an error sending your request. Please try again or contact us directly."
          );
        }
      )
      .finally(function () {
        // Reset button
        $(".btn-submit")
          .html('<i class="fas fa-paper-plane"></i> Get Free Quote')
          .prop("disabled", false);
      });
  }

  // Modal event listeners
  $(document).ready(function () {
    // Initialize EmailJS
    initializeEmailJS();

    // Close modal when clicking X
    $("#closeQuoteModal").on("click", closeQuoteModal);

    // Close modal when clicking outside
    $("#quoteModal").on("click", function (e) {
      if (e.target === this) {
        closeQuoteModal();
      }
    });

    // Close modal with Escape key
    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && $("#quoteModal").hasClass("active")) {
        closeQuoteModal();
      }
    });

    // Initialize quote form handler
    handleQuoteFormSubmission();
  });
})(jQuery);

// Global functions for inline HTML handlers
function closeQuoteModal() {
  $("#quoteModal").removeClass("active");
  setTimeout(() => {
    $("#quoteModal").hide();
    $("body").css("overflow", "auto"); // Restore scrolling
  }, 300);
}

// Newsletter Form Functionality
function initializeNewsletterForm() {
  const newsletterForm = document.querySelector(".newsletter-form-container");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const emailInput = this.querySelector('input[type="email"]');
      const submitBtn = this.querySelector('button[type="submit"]');
      const email = emailInput.value.trim();

      if (email && isValidEmail(email)) {
        // Show loading state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin me-2"></i>Subscribing...';
        submitBtn.disabled = true;

        // Simulate subscription process
        setTimeout(() => {
          submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Subscribed!';
          submitBtn.style.background = "#28a745";
          emailInput.value = "";

          // Show success notification
          showNotification(
            "Successfully subscribed to our newsletter!",
            "success"
          );

          // Reset button after 3 seconds
          setTimeout(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.background = "";
            submitBtn.disabled = false;
          }, 3000);
        }, 1500);
      } else {
        // Show error state
        emailInput.style.borderColor = "#dc3545";
        emailInput.style.boxShadow = "0 0 0 0.2rem rgba(220, 53, 69, 0.25)";
        emailInput.placeholder = "Please enter a valid email address";

        showNotification("Please enter a valid email address", "error");

        setTimeout(() => {
          emailInput.style.borderColor = "";
          emailInput.style.boxShadow = "";
          emailInput.placeholder = "Your Email Address";
        }, 3000);
      }
    });
  }
}

// Email validation helper function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Initialize newsletter form when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeNewsletterForm();
});

// Scheme Modal Functionality
const schemeDetails = {
  "pm-suryoday": {
    title: "PM Suryoday Yojana - Official Details",
    image: "img/schemes/pm-suryoday-scheme.jpg",
    filename: "PM_Suryoday_Yojana_Details.jpg",
  },
  "rooftop-solar": {
    title: "Rooftop Solar Subsidy Scheme",
    image: "img/schemes/pm-suryoday-scheme.jpg", // Using available image temporarily
    filename: "Rooftop_Solar_Scheme_Details.jpg",
  },
  "kusum-yojana": {
    title: "PM-KUSUM Yojana Details",
    image: "img/schemes/pm-suryoday-scheme.jpg", // Using available image temporarily
    filename: "PM_KUSUM_Yojana_Details.jpg",
  },
  "solar-park": {
    title: "Solar Park Scheme Details",
    image: "img/schemes/pm-suryoday-scheme.jpg", // Using available image temporarily
    filename: "Solar_Park_Scheme_Details.jpg",
  },
};

function openSchemeModal(schemeId) {
  const scheme = schemeDetails[schemeId];
  if (!scheme) {
    console.error("Scheme not found:", schemeId);
    showNotification("Scheme details not found!", "error");
    return;
  }

  const modal = document.getElementById("schemeModal");
  const modalTitle = document.getElementById("modalTitle");
  const schemeImage = document.getElementById("schemeImage");

  if (!modal || !modalTitle || !schemeImage) {
    console.error("Modal elements not found");
    showNotification("Error loading scheme details!", "error");
    return;
  }

  modalTitle.textContent = scheme.title;

  // Add loading state
  schemeImage.style.opacity = "0.5";
  schemeImage.src = scheme.image;
  schemeImage.alt = scheme.title;

  // Handle image load success
  schemeImage.onload = function () {
    schemeImage.style.opacity = "1";

    // Adjust modal size based on image dimensions
    const naturalWidth = schemeImage.naturalWidth;
    const naturalHeight = schemeImage.naturalHeight;

    // For wide banner images, ensure they display at optimal size
    if (naturalWidth > naturalHeight * 1.5) {
      modal.classList.add("wide-image-modal");
    }

    showNotification("Scheme details loaded successfully!", "success");
  };

  // Handle image load error
  schemeImage.onerror = function () {
    schemeImage.style.opacity = "1";
    schemeImage.src = "img/schemes/pm-suryoday-scheme.jpg"; // Fallback to known image
    showNotification("Loading scheme details...", "info");
  };

  // Store current scheme for download/share functions
  modal.setAttribute("data-current-scheme", schemeId);

  modal.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent background scrolling
}

function closeSchemeModal() {
  const modal = document.getElementById("schemeModal");
  modal.classList.remove("active");
  modal.classList.remove("wide-image-modal"); // Remove wide image class
  document.body.style.overflow = "auto"; // Restore scrolling
}

function downloadScheme() {
  const modal = document.getElementById("schemeModal");
  const schemeId = modal.getAttribute("data-current-scheme");
  const scheme = schemeDetails[schemeId];

  if (!scheme) return;

  // Create download link
  const link = document.createElement("a");
  link.href = scheme.image;
  link.download = scheme.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Show success message
  showNotification("Scheme details downloaded successfully!", "success");
}

function shareScheme() {
  const modal = document.getElementById("schemeModal");
  const schemeId = modal.getAttribute("data-current-scheme");
  const scheme = schemeDetails[schemeId];

  if (!scheme) return;

  if (navigator.share) {
    // Use native sharing if available
    navigator
      .share({
        title: scheme.title,
        text: `Check out the ${scheme.title} details from our solar energy website!`,
        url: window.location.href,
      })
      .then(() => {
        showNotification("Scheme details shared successfully!", "success");
      })
      .catch((err) => {
        console.log("Error sharing:", err);
        fallbackShare(scheme);
      });
  } else {
    // Fallback sharing options
    fallbackShare(scheme);
  }
}

function fallbackShare(scheme) {
  // Copy link to clipboard
  const shareUrl = `${window.location.href}#scheme-${scheme.title
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showNotification("Link copied to clipboard!", "success");
    });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = shareUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showNotification("Link copied to clipboard!", "success");
  }
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <span class="notification-icon">
            ${type === "success" ? "✓" : type === "error" ? "✗" : "ℹ"}
        </span>
        <span class="notification-message">${message}</span>
    `;

  // Add styles if they don't exist
  if (!document.querySelector("#notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fff;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                z-index: 10001;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: notificationSlideIn 0.3s ease;
                max-width: 300px;
            }
            .notification-success { border-left: 4px solid #4CAF50; }
            .notification-error { border-left: 4px solid #f44336; }
            .notification-info { border-left: 4px solid #2196F3; }
            .notification-icon {
                font-weight: bold;
                font-size: 1.2rem;
            }
            .notification-success .notification-icon { color: #4CAF50; }
            .notification-error .notification-icon { color: #f44336; }
            .notification-info .notification-icon { color: #2196F3; }
            @keyframes notificationSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "notificationSlideIn 0.3s ease reverse";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Close modal when clicking outside
document.addEventListener("click", function (event) {
  const modal = document.getElementById("schemeModal");
  if (modal && event.target === modal) {
    closeSchemeModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const modal = document.getElementById("schemeModal");
    if (modal && modal.classList.contains("active")) {
      closeSchemeModal();
    }
  }
});

// Modern Contact Form Functionality
function initializeContactForm() {
  const form = document.getElementById("quote-form");
  if (!form) return;

  const submitBtn = form.querySelector(".submit-btn-modern");
  const btnText = form.querySelector(".btn-text");

  // Form validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s]+$/,
      message: "Please enter a valid name (letters and spaces only)",
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
    mobile: {
      required: true,
      pattern: /^[0-9]{10}$/,
      message: "Please enter a valid 10-digit mobile number",
    },
    service: {
      required: true,
      message: "Please select a service type",
    },
  };

  // Real-time validation
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("focus", () => clearFieldValidation(input));
  });

  // Phone number formatting
  const mobileInput = form.querySelector("#mobile");
  if (mobileInput) {
    mobileInput.addEventListener("input", function () {
      let value = this.value.replace(/\D/g, "");
      if (value.length > 10) {
        value = value.substring(0, 10);
      }
      this.value = value;
    });
  }

  // Form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (validateForm()) {
      submitForm();
    }
  });

  function validateField(field) {
    const fieldName = field.getAttribute("name");
    const fieldValue = field.value.trim();
    const rules = validationRules[fieldName];
    const formGroup = field.closest(".form-group");

    if (!rules) return true;

    // Check required
    if (rules.required && !fieldValue) {
      showFieldError(formGroup, "This field is required");
      return false;
    }

    // Check minimum length
    if (rules.minLength && fieldValue.length < rules.minLength) {
      showFieldError(
        formGroup,
        `Minimum ${rules.minLength} characters required`
      );
      return false;
    }

    // Check pattern
    if (rules.pattern && fieldValue && !rules.pattern.test(fieldValue)) {
      showFieldError(formGroup, rules.message);
      return false;
    }

    // Field is valid
    showFieldSuccess(formGroup);
    return true;
  }

  function validateForm() {
    let isValid = true;

    inputs.forEach((input) => {
      if (input.hasAttribute("required") && !validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  function showFieldError(formGroup, message) {
    formGroup.classList.remove("success");
    formGroup.classList.add("error");

    // Remove existing error message
    const existingError = formGroup.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.cssText =
      "color: #dc3545; font-size: 12px; margin-top: 4px;";
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
  }

  function showFieldSuccess(formGroup) {
    formGroup.classList.remove("error");
    formGroup.classList.add("success");
    const errorMessage = formGroup.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  function clearFieldValidation(field) {
    const formGroup = field.closest(".form-group");
    formGroup.classList.remove("error", "success");
    const errorMessage = formGroup.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  function submitForm() {
    // Add loading state
    submitBtn.classList.add("loading");
    btnText.textContent = "Processing...";

    // Collect form data
    const formData = {
      name: form.querySelector("#name").value.trim(),
      email: form.querySelector("#email").value.trim(),
      mobile: form.querySelector("#mobile").value.trim(),
      service: form.querySelector("#service").value,
      message: form.querySelector("#message").value.trim(),
    };

    // Simulate API call
    setTimeout(() => {
      // Remove loading state
      submitBtn.classList.remove("loading");
      btnText.textContent = "Get Free Quote";

      // Show success message
      showSuccessMessage(formData);

      // Reset form
      resetForm();
    }, 2000);
  }

  function showSuccessMessage(formData) {
    alert(
      `Thank you ${formData.name}! Your message has been submitted successfully. We'll get back to you soon!`
    );
  }
}

// Initialize contact form when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeContactForm();
});
