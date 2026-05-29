const correctAnswers = {
    "1.jpg": ["sorted", "organized"],
    "2.jpg": ["sorted", "organized"],
    "3.jpg": "5s",
    "4.jpg": "organized",
    "5.jpg": ["sorted", "clean"],
    "6.jpg": "5s",
    "7.jpg": ["sorted", "organized"],
    "8.jpg": ["sorted", "clean"],
    "9.jpg": "5s",
    "10.jpg": ["sorted", "organized"],
};

let dragged = null;
let touchItem = null;

/* ======================
   ✅ GẮN DRAG EVENT
====================== */
function addDragEvents(el) {

    // PC drag
    el.addEventListener("dragstart", () => {
        dragged = el;
    });

    // ✅ QUAN TRỌNG: KÉO RA NGOÀI → XOÁ (PC)
    el.addEventListener("dragend", function (e) {

        // lấy vị trí chuột
        const x = e.clientX;
        const y = e.clientY;

        let target = document.elementFromPoint(x, y);

        // tìm xem có nằm trong image-box không
        while (target && !target.classList.contains("image-box")) {
            target = target.parentElement;
        }

        // ❗ nếu KHÔNG nằm trong box → xoá
        if (!target) {
            if (!el.classList.contains("source")) {
                el.remove();
            }
        }

        checkEnableButton();
    });
    // MOBILE
    el.addEventListener("touchstart", function () {

        if (el.classList.contains("source")) {
            touchItem = el.cloneNode(true);
            touchItem.classList.remove("source");

            document.body.appendChild(touchItem);
            addDragEvents(touchItem);
        } else {
            touchItem = el;
        }

        touchItem.classList.add("dragging");
    });
}

/* ======================
   ✅ INIT BANK
====================== */
document.querySelectorAll('.answer').forEach(item => {

    // PC
    item.addEventListener("dragstart", function () {

        if (this.classList.contains("source")) {
            dragged = this.cloneNode(true);
            dragged.classList.remove("source");

            addDragEvents(dragged);
        } else {
            dragged = this;
        }
    });

    // MOBILE
    item.addEventListener("touchstart", function () {

        if (this.classList.contains("source")) {
            touchItem = this.cloneNode(true);
            touchItem.classList.remove("source");

            document.body.appendChild(touchItem);
            addDragEvents(touchItem);
        } else {
            touchItem = this;
        }

        touchItem.classList.add("dragging");
    });

});

/* ======================
   ✅ DROP PC
====================== */
document.querySelectorAll(".image-box").forEach(box => {

    box.addEventListener("dragover", e => e.preventDefault());

    box.addEventListener("drop", function () {

        this.appendChild(dragged);

        // reset style
        dragged.style.position = "relative";
        dragged.style.left = "0";
        dragged.style.top = "0";

        addDragEvents(dragged);

        checkEnableButton();
    });

});

/* ======================
   ✅ MOVE MOBILE
====================== */
document.addEventListener("touchmove", function (e) {
    if (!touchItem) return;

    const touch = e.touches[0];

    touchItem.style.position = "absolute";
    touchItem.style.left = (touch.clientX - 40) + "px";
    touchItem.style.top = (touch.clientY - 20) + "px";
});

/* ======================
   ✅ DROP MOBILE
====================== */
document.addEventListener("touchend", function (e) {
    if (!touchItem) return;

    const touch = e.changedTouches[0];

    let target = document.elementFromPoint(touch.clientX, touch.clientY);

    while (target && !target.classList.contains("image-box")) {
        target = target.parentElement;
    }

    if (target) {

        target.appendChild(touchItem);

        // snap lại grid
        touchItem.style.position = "relative";
        touchItem.style.left = "0";
        touchItem.style.top = "0";

        addDragEvents(touchItem);

    } else {

        // ✅ THẢ NGOÀI → XOÁ
        if (!touchItem.classList.contains("source")) {
            touchItem.remove();
        }
    }

    touchItem.classList.remove("dragging");
    touchItem = null;

    checkEnableButton();
});

/* ======================
   ✅ ENABLE BUTTON
====================== */
function checkEnableButton() {
    const boxes = document.querySelectorAll(".image-box");

    let ready = true;

    boxes.forEach(box => {
        if (box.querySelectorAll(".answer").length === 0) {
            ready = false;
        }
    });

    document.getElementById("checkBtn").disabled = !ready;
}

/* ======================
   ✅ CHECK RESULT
====================== */
document.getElementById("checkBtn").onclick = () => {

    let correctCount = 0;
    let total = 0;

    document.querySelectorAll(".image-box").forEach(box => {

        total++;

        const correctType = correctAnswers[box.dataset.name];
        const answers = box.querySelectorAll(".answer");

        // reset trạng thái box
        box.classList.remove("correct-box", "wrong-box");

        const correctList = Array.isArray(correctType) ? correctType : [correctType];

        let boxCorrect = true;

        // ❗ phải đủ số lượng
        if (answers.length !== correctList.length) {
            boxCorrect = false;
        }

        answers.forEach(ans => {

            ans.textContent = ans.textContent.replace(" ✔", "").replace(" ✖", "");
            ans.classList.remove("correct", "wrong");

            const isCorrect = correctList.includes(ans.dataset.type);

            if (isCorrect) {
                ans.classList.add("correct");
                ans.textContent += " ✔";
            } else {
                ans.classList.add("wrong");
                ans.textContent += " ✖";
                boxCorrect = false;
            }
        });

        // ❗ kiểm tra thiếu đáp án
        const droppedTypes = Array.from(answers).map(a => a.dataset.type);

        const missing = correctList.some(type => !droppedTypes.includes(type));
        if (missing) {
            boxCorrect = false;
        }

        // ✅ tô màu khung
        if (boxCorrect) {
            box.classList.add("correct-box");   // xanh
            correctCount++;
        } else {
            box.classList.add("wrong-box");     // đỏ
        }

    });

    document.getElementById("resultText").innerHTML =
        `Bạn đúng <b>${correctCount} / ${total}</b>`;

    let modal = new bootstrap.Modal(document.getElementById("resultModal"));
    modal.show();
};