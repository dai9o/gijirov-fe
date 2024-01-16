import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"

import { Header } from "../../components/Header"

export default function SpeakerInfo() {
  const router = useRouter()
  const [speaker, setSpeaker] = useState()
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    if (!router.isReady) {return}
    let unmounted = false

    async function fetchSpeaker() {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/speaker`,
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
        setSpeaker(data)
        setIsLoaded(true)
      }
    }

    fetchSpeaker().catch((error) => {
      if (!unmounted) {
        setIsLoaded(true)
      }
    })

    return () => {unmounted = true}
  }, [router.isReady, router.query.slug])

  return (
    <>
      <Head>
        <title>
          {isLoaded && speaker ? `発言者情報: ${speaker.name}` : "発言者情報"}
        </title>
      </Head>

      <Header />
      <main className="pt-20 px-4 max-w-2xl mx-auto">
        {isLoaded && speaker &&
          <>
            <h1 className="mb-2 text-4xl font-black">{speaker.name}</h1>
            <div className="mb-4">
              {speaker.kanaFamilyName} {speaker.kanaGivenName}
            </div>
            <div>{() => {switch (speaker.gender) {
              case 0: return "男性"
              case 1: return "女性"
              default: return "その他"
            }}}</div>
            <div>党派: {speaker.party || "情報なし"}</div>
            <div>会派: {speaker.faction || "情報なし"}</div>
            <div>住所: {speaker.address || "情報なし"}</div>
          </>
        }
        {isLoaded && !speaker &&
          <>
            <h1 className="text-2xl font-bold">要求された発言者が見つかりませんでした</h1>
            <div>存在しない発言者 ID を参照したか、発言者データが削除された可能性があります。</div>
          </>
        }
      </main>
    </>
  )
}
