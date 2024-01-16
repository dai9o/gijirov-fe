function modURLSearchParams(usp, params) {
  const ret = new URLSearchParams(usp.toString())
  for (const [k, v] of Object.entries(params)) {
    ret.set(k, v)
  }
  return ret
}

export function PageController({ router, maxPage }) {
  const urlParams = new URLSearchParams(router.query)
  urlParams.delete("p")
  const page = Number(router.query.p || "1")

  //let URLParam = `q=${encodeURIComponent(router.query.q)}`
  //if (router.query.o) {URLParams += `&o={encodeURIComponent(router.query.o)}`}

  const pageArray = (function () {
    let ret = [1]
    for (let p = page - 3; p < page + 4; p++) {
      p > 1 && p < maxPage && ret.push(p)
    }
    maxPage !== 1 && ret.push(maxPage)
    return ret
  }());

  return (
    <div
      className="w-full flex flex-wrap justify-center items-center gap-10 p-8
                 text-4xl"
    >
      <a
        href={/*`/search?${URLParam}&p=${page - 1}`*/
              `${router.pathname}?${modURLSearchParams(urlParams, {p: page - 1})}`}
        hidden={page <= 1}
      >
        {"<"}
      </a>
      <div className="flex flex-wrap justify-center items-center gap-8 p-2
                      text-2xl">
        {[...pageArray.keys()].map((i) => (
          <>
            {i > 0 && pageArray[i] - pageArray[i - 1] > 1 && <div>...</div>}
            <a
              key={i}
              href={/*`/search?${URLParam}&p=${pageArray[i]}`*/
                    `${router.pathname}?${modURLSearchParams(urlParams, {p: pageArray[i]})}`}
              className={`hover:brightness-150
                          ${pageArray[i] === page && "font-bold"}`}
            >
              {pageArray[i].toString()}
            </a>
          </>
        ))}
      </div>
      <a
        href={/*`/search?${URLParam}&p=${page + 1}`*/
              `${router.pathname}?${modURLSearchParams(urlParams, {p: page + 1})}`}
        hidden={page >= maxPage}
      >
        {">"}
      </a>
    </div>
  )
}
