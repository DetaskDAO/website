

export default function AppFooter(params) {
    return (
        <footer className="Footer">
            <div className="content">
                <div>
                    <div className="logo">
                        <img src="/img/footer-logo.png" alt="" />
                    </div>
                </div>
                <div>
                    <ul className="list">
                        <li className="list-item">
                            <a href={process.env.NEXT_PUBLIC_SOCIAL_GITHUB_INVITE_URL} target="_blank"> 
                                <img src="/icon/footer-github.png" alt="" />
                            </a>
                        </li>
                        <li className="list-item">
                            <a href={process.env.NEXT_PUBLIC_SOCIAL_TWITTER_INVITE_URL} target="_blank"> 
                                <img src="/icon/footer-twitter.png" alt="" />
                            </a>
                        </li>
                        <li className="list-item">
                            <a href={process.env.NEXT_PUBLIC_SOCIAL_DISCORD_INVITE_URL} target="_blank">
                                <img src="/icon/footer-discord.png" alt="" />
                            </a>
                        </li>
                        <li className="list-item">
                            <a href={process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM_INVITE_URL} target="_blank">
                                <img src="/icon/footer-telegram.png" alt="" />
                            </a>
                        </li>
                        <li className="list-item">
                            <a href={process.env.NEXT_PUBLIC_SOCIAL_MEDIUM_INVITE_URL} target="_blank">
                                <img src="/icon/footer-medium.png" alt="" />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    )
}



