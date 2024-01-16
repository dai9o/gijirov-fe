import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { useDeactivation } from "../libs/useDeactivation"

export function Header({ router=null }) {
  const formRef = useRef()
  // 検索フォームの外側のクリック時に false となる
  const [formIsActive, setFormIsActive] = useDeactivation(formRef)

  return (
    <header
      className="fixed t-0 l-0 p-2 z-40 w-full text-blue-800 bg-slate-100/90
                 backdrop-blur shadow-lg"
    >
      <div
        className="flex justify-center gap-4 items-center max-w-2xl mx-auto"
      >
        <div
          className={`gap-4 items-center ${formIsActive ? "hidden" : "flex"}`}
        >
          <Link href="/" className="w-max">Home</Link>
          <Link href="/councils" className="w-max">会議</Link>
          <Link href="/speakers" className="w-max">発言者</Link>
        </div>
        <form
          method="get"
          action="/search"
          className={`relative w-full
                      ${formIsActive ? "rounded-t-xl" : "border border-blue-800 rounded-full"}`}
          ref={formRef}
        >
          <input
            className={`w-full px-4 py-2 ${formIsActive ? "rounded-t-xl bg-white" : "bg-transparent rounded-full"}`}
            type="search"
            name="q"
            placeholder="発言を検索"
            autoComplete="off"
            defaultValue={router?.query.q || ""}
            onFocus={() => {setFormIsActive(true)}}
          />
          <div
            className={`${formIsActive ? "absolute" : "hidden"} top-full w-full
                        bg-white max-h-[50vh] overflow-y-auto rounded-b-xl
                        shadow-xl`}
          >
            <div className="p-4 flex items-center gap-4 flex-wrap">
              <div>
                <label htmlFor="targetSelect">検索対象</label>
                <select
                  name="t" id="targetSelect"
                  defaultValue={router?.query.t || "content"}
                  className="ml-2 p-2 border border-blue-800 rounded-xl"
                >
                  <option value="content">発言内容</option>
                  <option value="parsedSentences">パース済み発言文</option>
                </select>
              </div>
              <div
                className="[&>label]:bg-inherit [&>label]:p-2
                           [&>label]:mr-2 [&>label]:rounded-xl
                           [&>input]:hidden"
              >
                <input type="checkbox" name="l" value="1" id="splitQueryCheckBox"
                 defaultChecked={router?.query.l === "1" || false}
                 className="peer/splitQueryCheckBox"/>
                <label
                  htmlFor="splitQueryCheckBox"
                  className="border border-blue-800
                             peer-checked/splitQueryCheckBox:text-white
                             peer-checked/splitQueryCheckBox:bg-blue-800"
                >
                  形態素分割する
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </header>
  )
}
