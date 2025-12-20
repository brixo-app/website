document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem('email');
  if (!email) {
    window.location.href = '/';
  } else {
    const usernames = document.querySelectorAll('.username');
    usernames.forEach((username) => {
      username.textContent = email.split('@')[0];;
    });
  }

  const ctaBtn = document.querySelector('#ctaBtn');
  const options = document.querySelectorAll(".option");

  options.forEach((option) => {
    option.addEventListener("click", () => {
      // Uncheck all
      options.forEach((opt) => {
        opt.classList.remove("checked");
      });

      // Check the clicked one
      option.classList.add("checked");

      // Make button active
      ctaBtn.classList.remove("inactive")
    });
  });  

  const logoutBtns = document.querySelectorAll('.logout');
  logoutBtns.forEach((logoutBtn) => {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('email');
      window.location.href = '/';
    });
  });
});
