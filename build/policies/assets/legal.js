// AQUA AI® legal pages — contents highlight, print button, mobile contents.
(function () {
  // Print / Save as PDF
  document.querySelectorAll("[data-print]").forEach(function (b) {
    b.addEventListener("click", function () {
      window.print();
    });
  });

  // Back to top
  document.querySelectorAll("[data-top]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  var toc = document.querySelector(".toc");
  if (!toc) return;
  var box = toc.querySelector("details");

  // On small screens the contents box starts collapsed and closes after a tap
  var mq = window.matchMedia("(max-width: 960px)");
  function syncOpen() {
    if (box) box.open = !mq.matches;
  }
  syncOpen();
  if (mq.addEventListener) mq.addEventListener("change", syncOpen);

  // Desktop: keep the contents always open
  if (box) {
    box.querySelector("summary").addEventListener("click", function (e) {
      if (!mq.matches) e.preventDefault();
    });
  }

  var links = Array.prototype.slice.call(toc.querySelectorAll("a[href^='#']"));
  links.forEach(function (a) {
    a.addEventListener("click", function () {
      if (mq.matches && box) box.open = false;
    });
  });

  // Highlight the section currently on screen
  if (!("IntersectionObserver" in window)) return;
  var byId = {};
  links.forEach(function (a) {
    byId[a.getAttribute("href").slice(1)] = a;
  });
  var visible = {};
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        visible[en.target.id] = en.isIntersecting;
      });
      var current = null;
      for (var i = 0; i < links.length; i++) {
        var id = links[i].getAttribute("href").slice(1);
        if (visible[id]) {
          current = id;
          break;
        }
      }
      if (!current) return;
      links.forEach(function (a) {
        a.classList.toggle("active", a === byId[current]);
      });
    },
    { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
  );
  Object.keys(byId).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) io.observe(el);
  });
})();
