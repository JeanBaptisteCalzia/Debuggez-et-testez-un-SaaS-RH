/**
 * @jest-environment jsdom
 */

// Allow to use matchers
import "@testing-library/jest-dom";
import { screen, fireEvent, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import { ROUTES } from "../constants/routes";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Verify new bill page is loaded", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // DOM construction
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Check if New bills title exist inside the page
      const newBillsTitle = screen.getByText("Envoyer une note de frais");
      expect(newBillsTitle).toBeTruthy();
    });

    test("Verify bill file is png only", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // DOM construction
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

      // Check if error-message class is not apply
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("click", handleChangeFile);
      // Describe a user interaction
      userEvent.click(inputFile);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile).not.toHaveClass("error-message");
    });

    test("Verify bill file is jpg only", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // DOM construction
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init new bills container
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const file = new File(["image"], "image.jpg", { type: "image/jpg" });
      const handleChangeFile = jest.fn((e) =>
        newBillContainer.handleChangeFile(e)
      );
      const billFile = screen.getByTestId("file");

      // Check if user upload file
      billFile.addEventListener("change", handleChangeFile);
      userEvent.upload(billFile, file);

      expect(billFile.files[0].name).toBeDefined();
      expect(billFile.files[0].type).toBe("image/jpg");
      expect(handleChangeFile).toBeCalled();

      // Check if error-message class is not apply
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("click", handleChangeFile);
      // Describe a user interaction
      userEvent.click(inputFile);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile).not.toHaveClass("error-message");
    });

    test("bill is not png or jpg files and display error message", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // DOM construction
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
      const file = screen.getByTestId("file");

      // Fire DOM events
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
        },
      });

      // Wait for file processing when user upload a file
      await new Promise((resolve) => setTimeout(resolve, 5));

      // Check if error message is displayed (not jpg or png)
      expect(handleChangeFile).toHaveBeenCalled();
      expect(file).toHaveClass("error-message");
      expect(newBillContainer.fileName).toBe("");
    });
  });
});

// Integration test POST Bills
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("fetches new bills from mock API POST", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // DOM construction
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Check if New bills title exist inside the page
      const newBillsTitle = screen.getByText("Envoyer une note de frais");
      expect(newBillsTitle).toBeTruthy();
    });

    describe("user submit form", () => {
      test("call api update bills", async () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });

        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee" })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.NewBill);

        // DOM construction
        const html = NewBillUI();
        document.body.innerHTML = html;

        // Form
        const newBillForm = screen.getByTestId("form-new-bill");

        // Init new bills containers
        const billContainer = {
          email: "employee@test.tld",
          type: "Transports",
          name: "Vol Paris Marseille",
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

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // Init Newbill container
        const newBillContainer = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const handleSubmitSpy = jest.spyOn(newBillContainer, "handleSubmit");
        newBillForm.addEventListener("submit", newBillContainer.handleSubmit);
        fireEvent.submit(newBillForm);
        expect(handleSubmitSpy).toHaveBeenCalled();

        await waitFor(() => screen.getByText("Mes notes de frais"));
        const BillsTitle = screen.getByText("Mes notes de frais");
        expect(BillsTitle).toBeTruthy();
      });
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        // DOM construction
        document.body.innerHTML = BillsUI({ error: "Erreur 404" });

        // await for response
        const message = screen.getByText(/Erreur 404/);

        // expected result
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        // DOM construction
        document.body.innerHTML = BillsUI({ error: "Erreur 500" });

        // await for response
        const message = screen.getByText(/Erreur 500/);

        // expected result
        expect(message).toBeTruthy();
      });
    });
  });
});
