import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"

import { getSectionTypeString } from "../../libs/sectionType"
import { Header } from "../../components/Header"
import { SpeakerPop } from "../../components/SpeakerPop"

export default function CouncilView() {
  const router = useRouter()
  const [council, setCouncil] = useState()
  const sectionRef = useRef()
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    if (!router.isReady) {return}
    let unmounted = false

    async function fetchCouncil() {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/council`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: router.query.slug
          })
        }
      )
      const data = await response.json()
      if (!unmounted) {
        setCouncil(data)
        setIsLoaded(true)
      }
    }

    fetchCouncil().catch((error) => {
      if (!unmounted) {
        setIsLoaded(true)
      }
    })

    return () => {unmounted = true}
  }, [router.isReady, router.query.slug])

  useEffect(() => {
    sectionRef.current?.scrollIntoView({behavior: "smooth"})
  }, [council])

  return (
    <>
      <Head>
        <title>
          {isLoaded && council ? `会議録: ${council.name}` : "会議録"}
        </title>
      </Head>

      <Header />
      <main className="pt-20 px-4 max-w-2xl mx-auto">
        {isLoaded && council &&
          <>
            <div className="mb-8 pb-4 border-b border-slate-300">
              <h1 className="font-bold text-xl">{council.name}</h1>
              <div>開催: {council.heldOn} / 取得: {council.retrievedAt}</div>
              <div>
                <a
                  href={council.url}
                  className="text-blue-800 hover:underline"
                >
                  ソース
                </a>
              </div>
            </div>
            {council.sections.map((section) => {
              let bg = "bg-white"
              if (section.type === 1) {bg = "bg-green-300"}
              else if (section.type === 2) {bg = "bg-slate-300"}
              else if (section.type === 3) {bg = "bg-blue-300"}
              return (
                <div
                  key={section.id}
                  ref={section.id === router.query.sectionid ? sectionRef : undefined}
                  className="mb-8"
                >
                  <SpeakerPop
                    speakerID={section.speakerID}
                    className={`mb-2 text-sm font-bold ${section.speakerID ? "hover:underline" : ""}
                                ${section.id === router.query.sectionid ? "bg-yellow-200": ""}`}
                  >
                    {section.speakerID ? `${getSectionTypeString(section.type)}: ${section.speakerName} (${section.speakerParty || ""} ${section.role || "role unknown"})`
                    : "発言者情報なし"}
                  </SpeakerPop>
                  <div
                    className={`break-all rounded-bl-xl rounded-r-xl p-3 ${bg}`}
                  >
                    {section.content}
                  </div>
                </div>
              )
            })}
          </>
        }
        {isLoaded && !council &&
          <>
            <h1 className="text-2xl font-bold">要求された会議が見つかりませんでした</h1>
            <div>存在しない会議 ID を参照したか、会議データが削除された可能性があります。</div>
          </>
        }
      </main>
    </>
  )
}
