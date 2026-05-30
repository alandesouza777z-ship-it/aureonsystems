const STORAGE_KEYS = {
  draft: "aureon:project-intake:draft",
  submissions: "aureon:project-intake:submissions",
};

const FEATURE_OPTIONS = [
  "Cadastro de clientes",
  "Controle financeiro",
  "Agenda",
  "Relatórios",
  "Controle de estoque",
  "Controle de vendas",
  "Painel administrativo",
  "Controle de usuários",
  "Integração com WhatsApp",
  "Integração com API",
  "Área do cliente",
  "Dashboard",
  "Outro",
];

const INTEGRATION_OPTIONS = [
  "WhatsApp",
  "API externa",
  "Mercado Pago",
  "Asaas",
  "Stripe",
  "ERP",
  "E-mail",
  "Outro",
];

const URGENCY_OPTIONS = ["Baixa", "Média", "Alta", "Muito alta"];

const BUDGET_OPTIONS = [
  "Até R$ 2.000",
  "R$ 2.000 a R$ 5.000",
  "R$ 5.000 a R$ 10.000",
  "Acima de R$ 10.000",
  "Prefiro não informar",
];

const form = document.querySelector("#projectForm");
const draftStatus = document.querySelector("#draftStatus");
const successDialog = document.querySelector("#successDialog");
const closeDialogButton = document.querySelector("#closeDialog");

const storage = {
  get(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      return false;
    }
    return true;
  },
};

function createChoiceCard({ type, name, value }) {
  const label = document.createElement("label");
  label.className = type === "checkbox" ? "check-card" : "radio-card";

  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.value = value;

  const indicator = document.createElement("span");
  indicator.className = type === "checkbox" ? "custom-check" : "custom-radio";
  indicator.setAttribute("aria-hidden", "true");

  const text = document.createElement("span");
  text.textContent = value;

  label.append(input, indicator, text);
  return label;
}

function renderChoiceGroup(containerId, options, type, name) {
  const container = document.querySelector(`#${containerId}`);
  const fragment = document.createDocumentFragment();

  options.forEach((value) => {
    fragment.append(createChoiceCard({ type, name, value }));
  });

  container.append(fragment);
}

function getCheckedValues(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function getRadioValue(name) {
  return form.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function setCheckedValues(name, values = []) {
  form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = values.includes(input.value);
  });
}

function setRadioValue(name, value) {
  const input = [...form.querySelectorAll(`input[name="${name}"]`)].find((item) => item.value === value);
  if (input) input.checked = true;
}

function updateConditionalFields() {
  const hasOtherFeature = getCheckedValues("features").includes("Outro");
  const hasOtherIntegration = getCheckedValues("integrations").includes("Outro");

  toggleOtherField("#otherFeatureWrap", "#otherFeature", hasOtherFeature);
  toggleOtherField("#otherIntegrationWrap", "#otherIntegration", hasOtherIntegration);
}

function toggleOtherField(wrapperSelector, inputSelector, isVisible) {
  const wrapper = document.querySelector(wrapperSelector);
  const input = document.querySelector(inputSelector);

  wrapper.hidden = !isVisible;
  input.required = isVisible;
  if (!isVisible) {
    input.value = "";
    setFieldValidity(input, true);
  }
}

function normalizePhone(value) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function formatPhone(value) {
  const digits = normalizePhone(value);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function setFieldValidity(input, isValid) {
  const field = input.closest(".field") || input.closest(".form-section");
  if (field) field.classList.toggle("is-invalid", !isValid);
}

function validateTextInput(input) {
  let isValid = input.checkValidity();

  if (input.id === "whatsapp") {
    const length = normalizePhone(input.value).length;
    isValid = input.required ? length >= 10 : length === 0 || length >= 10;
  }

  setFieldValidity(input, isValid);
  return isValid;
}

function validateRadioGroup(groupName) {
  const input = form.querySelector(`input[name="${groupName}"]`);
  const field = input?.closest(".field");
  const isValid = Boolean(getRadioValue(groupName));

  if (field) field.classList.toggle("is-invalid", !isValid);
  return isValid;
}

function validateConfirmation() {
  const confirmation = document.querySelector("#confirmation");
  const section = confirmation.closest(".confirmation-section");
  const isValid = confirmation.checked;

  section.classList.toggle("is-invalid", !isValid);
  return isValid;
}

function validateForm() {
  const requiredFields = [...form.querySelectorAll("input[required], textarea[required]")].filter(
    (input) => input.type !== "radio" && input.type !== "checkbox",
  );

  const textFieldsValid = requiredFields.map(validateTextInput).every(Boolean);
  const urgencyValid = validateRadioGroup("urgency");
  const budgetValid = validateRadioGroup("budget");
  const confirmationValid = validateConfirmation();

  return textFieldsValid && urgencyValid && budgetValid && confirmationValid;
}

function collectFormData() {
  const formData = new FormData(form);

  return {
    client: {
      fullName: formData.get("fullName")?.trim() || "",
      companyName: formData.get("companyName")?.trim() || "",
      whatsapp: formData.get("whatsapp")?.trim() || "",
      email: formData.get("email")?.trim() || "",
    },
    project: {
      mainGoal: formData.get("mainGoal")?.trim() || "",
      problemToSolve: formData.get("problemToSolve")?.trim() || "",
      systemUsers: formData.get("systemUsers")?.trim() || "",
      userCount: formData.get("userCount") || "",
    },
    scope: {
      features: getCheckedValues("features"),
      otherFeature: formData.get("otherFeature")?.trim() || "",
      featureDetails: formData.get("featureDetails")?.trim() || "",
    },
    references: {
      similarSystem: formData.get("similarSystem")?.trim() || "",
      referenceLinks: formData.get("referenceLinks")?.trim() || "",
    },
    integrations: {
      selected: getCheckedValues("integrations"),
      otherIntegration: formData.get("otherIntegration")?.trim() || "",
    },
    timing: {
      deadline: formData.get("deadline") || "",
      urgency: getRadioValue("urgency"),
    },
    budget: getRadioValue("budget"),
    confirmation: Boolean(formData.get("confirmation")),
    submittedAt: new Date().toISOString(),
  };
}

function saveDraft() {
  const saved = storage.set(STORAGE_KEYS.draft, collectFormData());
  draftStatus.textContent = saved
    ? "Rascunho salvo neste dispositivo."
    : "Não foi possível salvar o rascunho localmente.";
}

function restoreDraft() {
  const draft = storage.get(STORAGE_KEYS.draft, null);
  if (!draft) return;

  const mappings = {
    fullName: draft.client?.fullName,
    companyName: draft.client?.companyName,
    whatsapp: draft.client?.whatsapp,
    email: draft.client?.email,
    mainGoal: draft.project?.mainGoal,
    problemToSolve: draft.project?.problemToSolve,
    systemUsers: draft.project?.systemUsers,
    userCount: draft.project?.userCount,
    otherFeature: draft.scope?.otherFeature,
    featureDetails: draft.scope?.featureDetails,
    similarSystem: draft.references?.similarSystem,
    referenceLinks: draft.references?.referenceLinks,
    otherIntegration: draft.integrations?.otherIntegration,
    deadline: draft.timing?.deadline,
  };

  Object.entries(mappings).forEach(([name, value]) => {
    const input = form.elements[name];
    if (input && value) input.value = value;
  });

  setCheckedValues("features", draft.scope?.features);
  setCheckedValues("integrations", draft.integrations?.selected);
  setRadioValue("urgency", draft.timing?.urgency);
  setRadioValue("budget", draft.budget);

  if (draft.confirmation) {
    form.elements.confirmation.checked = true;
  }

  updateConditionalFields();
}

function saveSubmission(payload) {
  const submissions = storage.get(STORAGE_KEYS.submissions, []);
  submissions.push(payload);

  const saved = storage.set(STORAGE_KEYS.submissions, submissions);

  /*
    Future Supabase integration point:
    await supabase.from("project_intake").insert(payload);
  */

  return saved;
}

function showSuccessMessage() {
  if (typeof successDialog.showModal === "function") {
    successDialog.showModal();
    return;
  }

  window.alert(
    "Obrigado pelo envio! A equipe da Aureon Sistemas analisará as informações e retornará com uma proposta comercial e escopo detalhado para aprovação.",
  );
}

function scrollToFirstError() {
  const firstError = form.querySelector(".is-invalid");
  if (firstError) {
    firstError.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

renderChoiceGroup("featuresGroup", FEATURE_OPTIONS, "checkbox", "features");
renderChoiceGroup("integrationsGroup", INTEGRATION_OPTIONS, "checkbox", "integrations");
renderChoiceGroup("urgencyGroup", URGENCY_OPTIONS, "radio", "urgency");
renderChoiceGroup("budgetGroup", BUDGET_OPTIONS, "radio", "budget");

restoreDraft();
updateConditionalFields();

form.addEventListener("input", (event) => {
  const target = event.target;

  if (target.id === "whatsapp") {
    target.value = formatPhone(target.value);
  }

  if (target.matches("input, textarea")) {
    validateTextInput(target);
  }

  saveDraft();
});

form.addEventListener("change", (event) => {
  if (event.target.name === "features" || event.target.name === "integrations") {
    updateConditionalFields();
  }

  if (event.target.name === "urgency" || event.target.name === "budget") {
    validateRadioGroup(event.target.name);
  }

  if (event.target.name === "confirmation") {
    validateConfirmation();
  }

  saveDraft();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    scrollToFirstError();
    return;
  }

  const payload = collectFormData();
  saveSubmission(payload);
  storage.remove(STORAGE_KEYS.draft);
  draftStatus.textContent = "Formulário enviado e salvo localmente.";
  showSuccessMessage();
});

closeDialogButton.addEventListener("click", () => {
  successDialog.close();
});
