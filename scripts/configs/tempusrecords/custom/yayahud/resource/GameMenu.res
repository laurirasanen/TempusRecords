"GameMenu" [$WIN32]
{
	"ServerBrowserButton"
	{
		"label" "SERVERS" 
		"command" "OpenServerBrowser"
	}
	"CharacterSetupButton"
	{
		"label" "ITEMS"
		"command" "engine open_charinfo"
	}
	"ReplaysButton"
	{
		"label" "REPLAYS"
		"command" "engine replay_reloadbrowser"
	}
	"DemoUIButton"
	{
		"label" "q"
		"command" "engine demoui"
		"tooltip" "DEMOUI"
	}
	"ToggleScoreboard"
	{
		"label" "n"
		"command" "engine toggle cl_hud_minmode"
        "tooltip" "TOGGLE SCOREBOARD"
	}
	"CreateServerButton"
	{
		"label" 	"+"
		"command" 	"OpenCreateMultiplayerGameDialog"
	}
	"ConsoleButton"
	{
		"label"		"CONSOLE"
		"command" 	"engine con_enable 1;toggleconsole"
	}
	"HomeServer"
	{
		"label" "7"
		"command" "engine Home"
        "tooltip" "HOME SERVER"
	}
	"QuitButton"
	{
		"label" "QUIT"
		"command" "engine replay_confirmquit"
		"OnlyAtMenu" "1"
	}
	"SettingsButton"
	{
		"label" "OPTIONS"
		"command" "OpenOptionsDialog"
	}
    "AchievementsButton"
	{
		"label"			"B"
		"command"		"OpenAchievementsDialog"
        "tooltip" "ACHIEVEMENTS"
	}
    "AdvOptionsButton"
	{
		"label"		"@"
		"command"	"opentf2options"
		"tooltip"   "ADVANCED OPTIONS"
	}
	// These buttons are only shown while in-game
    
	"DisconnectButton"
	{
		"label" "LEAVE"
		"command" "engine disconnect"
		"OnlyInGame"	"1"
	}
	"CallVoteButton"
	{
		"label"			"W"
		"command"		"callvote"
		"OnlyInGame"	"1"
		"tooltip" "CALL VOTE"
	}
	"MutePlayersButton"
	{
		"label"			"O"
		"command"		"OpenPlayerListDialog"
		"OnlyInGame"	"1"
        "tooltip" "MUTE PLAYERS"
	}
	"RequestCoachButton"
	{
		"label"			""
		"command"		"engine cl_coach_find_coach"
		"OnlyAtMenu" "0"
		"subimage" "icon_whistle"
		"tooltip" "#MMenu_RequestCoach"
	}
}
