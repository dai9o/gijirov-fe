import { useState, useRef } from "react"

export function SpeakerPop({ speakerID, className, children }) {
  const [speaker, setSpeaker] = useState()
  const tooltipRef = useRef()

  function handleMouseEnter() {
    if (!tooltipRef.current) {return}

    async function fetchSpeaker() {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/speaker`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: speakerID
          })
        }
      )
      const data = await response.json()

      let genderString = "性別不明"
      if (data.gender === 1) {
        genderString = "男性"
      } else if (data.gender === 2) {
        genderString = "女性"
      } else if (data.gender === 3) {
        genderString = "その他"
      }

      setSpeaker({...data, genderString})
      tooltipRef.current.style.opacity = "1"
      tooltipRef.current.classList.remove("invisible")
    }

    fetchSpeaker().catch((error) => {
      setSpeaker()
    })
  }

  function handleMouseLeave() {
    if (!tooltipRef.current) {return}
    tooltipRef.current.style.opacity = "0"
    tooltipRef.current.classList.add("invisible")
  }

  return (
    <div
      className="flex relative items-center w-fit"
      onMouseEnter={speakerID ? handleMouseEnter : undefined}
      onMouseLeave={speakerID ? handleMouseLeave : undefined}
    >
      <div
        className="w-60 p-4 z-50 invisible absolute top-full left-1/2 bg-slate-50/60 backdrop-blur shadow-xl rounded-xl transition-all duration-150 transform -translate-x-1/3"
        ref={tooltipRef}
      >
        {speaker ? <>
          <h1 className="mb-1 text-lg font-black">{speaker.name}</h1>
          <div className="mb-2 text-xs">
            {speaker.kanaFamilyName} {speaker.kanaGivenName}
          </div>
          <div className="text-sm">
            {/*<div>{speaker.genderString}</div>*/}
            <div>党派: {speaker.party || "情報なし"}</div>
            <div>会派: {speaker.faction || "情報なし"}</div>
            <div>住所: {speaker.address || "情報なし"}</div>
          </div>
        </> : <>
          &quot;Loading...&quot;
        </>}
      </div>

      <div className={className}>
        {speakerID ? <a href={`/speakers/${speakerID}`}>{children}</a>
        : children}
      </div>
    </div>
  )
}
