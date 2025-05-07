document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll(".code-container input");
    inputs.forEach((input, index) => {
        input.addEventListener("input", (e) => {
            const value = e.target.value;
            if (value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
    });
});