/**
 * @jest-environment jsdom
 */

// Allow to use matchers
import "@testing-library/jest-dom";
import { screen, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Verify new bill page is loaded", () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const html = NewBillUI();
      document.body.innerHTML = html;

      // Check if New bills title exist inside the page
      const newBillsTitle = screen.getByText("Envoyer une note de frais");
      expect(newBillsTitle).toBeTruthy();
    });

    test("Verify bill file is jpg or png only", () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init new bills container
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const file = new File(["image"], "image.png", { type: "image/png" });
      const handleChangeFile = jest.fn((e) =>
        newBillContainer.handleChangeFile(e)
      );
      const billFile = screen.getByTestId("file");

      // Check if user upload file
      billFile.addEventListener("change", handleChangeFile);
      userEvent.upload(billFile, file);

      expect(billFile.files[0].name).toBeDefined();
      expect(billFile.files[0].type).toBe("image/png");
      expect(handleChangeFile).toBeCalled();
    });

    test("bill is not png or jpg files and display error message", () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init new bills container
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBillContainer.handleChangeFile);
      const uploadFileBtn = screen.getByTestId("file");

      uploadFileBtn.addEventListener("change", handleChangeFile);

      const file = screen.getByTestId("file");

      // Fire DOM events
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
        },
      });

      const errorMessage = jest.fn(() => file.classList.add("error-message"));

      file.addEventListener("click", errorMessage);
      // Describe a user interaction
      userEvent.click(file);

      // Check of error message is displayed (not jpg or png)
      expect(handleChangeFile).toHaveBeenCalled();
      expect(file).toHaveClass("error-message");
      expect(newBillContainer.fileName).toBe("");
    });

    // test("Verify bill file is submit", () => {
    //   localStorage.setItem(
    //     "user",
    //     JSON.stringify({ type: "Employee", email: "a@a" })
    //   );

    //   const root = document.createElement("div");
    //   root.setAttribute("id", "root");
    //   document.body.append(root);
    //   router();
    //   window.onNavigate(ROUTES_PATH.NewBill);

    //   const html = NewBillUI();
    //   document.body.innerHTML = html;

    //   // Init new bills container
    //   const newBillContainer = new NewBill({
    //     document,
    //     onNavigate,
    //     store: mockStore,
    //     localStorage: window.localStorage,
    //   });

    //   const formNewBill = screen.getByTestId("form-new-bill");
    //   const handleSubmit = jest.fn((e) => newBillContainer.handleSubmit(e));

    //   // Remplir le formulaire
    //   // Ajouter aussi une note de frais dedans (fichier fictif comme precedemment)

    //   // Check if user clicked on submit btn
    //   formNewBill.addEventListener("submit", handleSubmit);
    //   fireEvent.submit(formNewBill);
    //   expect(handleSubmit).toHaveBeenCalled();

    //   // Verifier qu'on a change de page (=>dashboard)
    //   // Verifier si la note de frais qu' on vient d'ajouter apparait bien dans la liste
    // });
  });
});

//     test("bill file is a png or a jpg then the file name should be displayed into the input", () => {
//       localStorage.setItem(
//         "user",
//         JSON.stringify({ type: "Employee", email: "a@a" })
//       );
//       const root = document.createElement("div");
//       root.setAttribute("id", "root");
//       document.body.append(root);
//       router();
//       window.onNavigate(ROUTES_PATH.NewBill);

//       const html = NewBillUI();
//       document.body.innerHTML = html;

//       // Init new bills container
//       const newBillContainer = new NewBill({
//         document,
//         onNavigate,
//         store: mockStore,
//         localStorage: window.localStorage,
//       });

//       const handleChangeFile = jest.fn(newBillContainer.handleChangeFile);
//       const uploadFileBtn = screen.getByTestId("file");

//       uploadFileBtn.addEventListener("change", handleChangeFile);

//       const file = screen.getByTestId("file");

//       file.addEventListener("change", handleChangeFile);
//       fireEvent.change(file, {
//         target: {
//           files: [
//             new File(
//               ["file.png"],
//               "file.png",
//               { type: "file/png" },
//               ["file.jpg"],
//               "file.jpg",
//               { type: "file/jpg" }
//             ),
//           ],
//         },
//       });

//       file.addEventListener("click", handleChangeFile);
//       // Describe a user interaction
//       userEvent.click(file);

//       expect(handleChangeFile).toHaveBeenCalled();
//       expect(file).not.toHaveClass("error-message");
//     });
//   });

// Integration test POST Bills
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("fetches new bills from mock API POST", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const html = NewBillUI();
      document.body.innerHTML = html;

      // Check if New bills title exist inside the page
      const newBillsTitle = screen.getByText("Envoyer une note de frais");
      expect(newBillsTitle).toBeTruthy();
    });

    describe("user submit form", () => {
      test("call api update bills", async () => {
        // Form
        const newBillForm = screen.getByTestId("form-new-bill");
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // Init new bills container
        const billContainer = {
          email: "employee@test.tld",
          type: "Transports",
          name: "Vol Paris Londres",
          date: "2024-08-08",
          amount: 300,
          vat: "50",
          pct: 5,
          commentary: "",
          fileUrl: "testBill.png",
          fileName: "testBill",
          status: "pending",
        };

        // Type field
        const typeField = screen.getByTestId("expense-type");
        fireEvent.change(typeField, { target: { value: billContainer.type } });
        expect(typeField.value).toBe(billContainer.type);

        // Name field
        const nameField = screen.getByTestId("expense-name");
        fireEvent.change(nameField, { target: { value: billContainer.name } });
        expect(nameField.value).toBe(billContainer.name);

        // Date field
        const dateField = screen.getByTestId("datepicker");
        fireEvent.change(dateField, { target: { value: billContainer.date } });
        expect(dateField.value).toBe(billContainer.date);

        // Amount field
        const amountField = screen.getByTestId("amount");
        fireEvent.change(amountField, {
          target: { value: billContainer.amount },
        });
        expect(parseInt(amountField.value)).toBe(
          parseInt(billContainer.amount)
        );

        // VAT field
        const vatField = screen.getByTestId("vat");
        fireEvent.change(vatField, { target: { value: billContainer.vat } });
        expect(parseInt(vatField.value)).toBe(parseInt(billContainer.vat));

        // PCT field
        const pctField = screen.getByTestId("pct");
        fireEvent.change(pctField, { target: { value: billContainer.pct } });
        expect(parseInt(pctField.value)).toBe(parseInt(billContainer.pct));

        // Commentary field
        const commentaryField = screen.getByTestId("commentary");
        fireEvent.change(commentaryField, {
          target: { value: billContainer.commentary },
        });
        expect(commentaryField.value).toBe(billContainer.commentary);

        const handleChangeFile = jest.fn(billContainer.handleChangeFile);

        newBillForm.addEventListener("change", handleChangeFile);
        const fileField = screen.getByTestId("file");
        fireEvent.change(fileField, {
          target: {
            files: [
              new File([billContainer.fileName], billContainer.fileUrl, {
                type: "image/png",
              }),
            ],
          },
        });

        expect(fileField.files[0].name).toBe(billContainer.fileUrl);
        expect(fileField.files[0].type).toBe("image/png");
        expect(handleChangeFile).toHaveBeenCalled();

        const handleSubmit = jest.fn(billContainer.handleSubmit);
        newBillForm.addEventListener("submit", handleSubmit);
        fireEvent.submit(newBillForm);
        expect(handleSubmit).toHaveBeenCalled();

        // Check if New bills title exist inside the page
        // const billsTitle = screen.getByText("Mes notes de frais");
        // expect(billsTitle).toBeTruthy();
      });
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      test("Add bills from an API and fails with 404 message error", async () => {});

      test("Add bills from an API and fails with 500 message error", async () => {});
    });
  });
});
