import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];
    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    // Fix bug 3 : Modale should display images (jpg, jpeg, png only)
    // Bills application only allows PNG, and JPEG images
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);

    // We retrieve error message
    const errorMessage = document.querySelectorAll("span.error-message");

    // We delete error message (span)
    for (const [key, message] of Object.entries(errorMessage)) {
      message.remove(errorMessage);
    }

    // Get file Format function
    function getFileFormat(arrayBuffer) {
      const arr = new Uint8Array(arrayBuffer).subarray(0, 4);
      let header = "";

      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }

      // Billed app allow only JPEG and PNG format
      switch (true) {
        case /^89504e47/.test(header):
          return "image/png";
        case /^ffd8ff/.test(header):
          return "image/jpeg";
        default:
          return "unknown image format";
      }
    }

    const fileUploaded = e.target.files[0];
    const type = fileUploaded.type;
    const reader = new FileReader();

    reader.onload = function (e) {
      const result = e.target.result;
      const format = getFileFormat(result);

      if (format === type) {
        fileInput.classList.remove("red-border");
        fileInput.classList.add("blue-border");
      } else {
        fileInput.value = "";
        fileInput.classList.remove("blue-border");
        fileInput.classList.add("red-border");
        const spanErrorMessage = document.createElement("span");
        spanErrorMessage.classList.add("error-message");
        spanErrorMessage.textContent =
          "You can only upload jpeg, jpg or png files";
        fileInput.after(spanErrorMessage);
        return false;
      }
    };
    // readAsArrayBuffer() method allow to read file
    reader.readAsArrayBuffer(fileUploaded);
    // End fix bug 3

    this.formData = formData;
    this.fileName = fileName;

    formData.append("file", file);
    formData.append("email", email);

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        console.log(fileUrl);
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
      })
      .catch((error) => console.error(error));
  };
  handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
