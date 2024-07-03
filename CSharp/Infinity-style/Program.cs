﻿// The Infinity's Infinity Style Static Site Generator
using System.Text.Json;

Console.WriteLine("-------Infinity Style Static Site Generator-------");

InfinityStyle.ReadSettingData();

public struct htmlTemp
{
    private htmlTemp(string head, string foot)
    {
        head = "";
        foot = "";
    }
}

public class SettingData
{
    public Dictionary<string, customDate>? CustomDate { get; set; }

    public string? repositoryName { get; set; }
}

public class customDate
{
    public bool? isAuto { get; set; }
    public int? year { get; set; }
    public int? month { get; set; }
}

public static class InfinityStyle
{
    public static void ReadSettingData()
    {
        // 続きはここを見てやろう。
        // https://learn.microsoft.com/ja-jp/dotnet/standard/serialization/system-text-json/deserialization
        StreamReader settingJsonFile = new StreamReader("./test.json");
        string settingJsonText = settingJsonFile.ReadToEnd();
        Console.WriteLine("Read setting.json:\n\"\"\"\n" + settingJsonText + "\n\"\"\"");
        SettingData? settingData = JsonSerializer.Deserialize<SettingData>(
            settingJsonText
        );
        Console.WriteLine(settingData?.repositoryName);
    }
}
