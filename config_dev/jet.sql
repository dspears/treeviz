-- phpMyAdmin SQL Dump
-- version 4.1.6
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Mar 14, 2014 at 12:40 AM
-- Server version: 5.5.35-0ubuntu0.12.04.1
-- PHP Version: 5.3.10-1ubuntu3.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `jet`
--

-- --------------------------------------------------------

--
-- Table structure for table `domains`
--

CREATE TABLE IF NOT EXISTS `domains` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nodeType` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `nodeName` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `tleft` int(10) unsigned NOT NULL,
  `tright` int(10) unsigned NOT NULL,
  `treepath` varchar(1024) COLLATE utf8_unicode_ci NOT NULL,
  `numChildNodes` int(10) unsigned NOT NULL,
  `numLeaves` int(10) unsigned NOT NULL,
  `numDescendantNodes` int(10) unsigned NOT NULL,
  `numDescendantLeaves` int(10) unsigned NOT NULL,
  `source_id` int(10) unsigned NOT NULL,
  `url` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `rank` int(10) unsigned NOT NULL,
  `site` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d6` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d5` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d4` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d3` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d2` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d1` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d0` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `path` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `tldtype` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `country` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `language` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `Updated_By` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `Updated_On` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rank` (`rank`),
  KEY `url` (`url`(255)),
  KEY `d0` (`d0`),
  KEY `d1` (`d1`),
  KEY `d2` (`d2`),
  KEY `d3` (`d3`),
  KEY `d4` (`d4`),
  KEY `d5` (`d5`),
  KEY `d6` (`d6`),
  KEY `site` (`site`),
  KEY `tldtype` (`tldtype`),
  KEY `country` (`country`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=10137 ;

-- --------------------------------------------------------

--
-- Table structure for table `tlds`
--

CREATE TABLE IF NOT EXISTS `tlds` (
  `tld` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `tldtype` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `country` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `sponsor` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `Updated_By` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `Updated_On` datetime NOT NULL,
  PRIMARY KEY (`tld`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `top1m`
--

CREATE TABLE IF NOT EXISTS `top1m` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `url` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `rank` int(10) unsigned NOT NULL,
  `site` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d6` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d5` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d4` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d3` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d2` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d1` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d0` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `path` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `tldtype` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `country` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `language` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `Updated_By` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `Updated_On` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rank` (`rank`),
  KEY `url` (`url`(255)),
  KEY `d0` (`d0`),
  KEY `d1` (`d1`),
  KEY `d2` (`d2`),
  KEY `d3` (`d3`),
  KEY `d4` (`d4`),
  KEY `d5` (`d5`),
  KEY `d6` (`d6`),
  KEY `site` (`site`),
  KEY `tldtype` (`tldtype`),
  KEY `country` (`country`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=509763 ;

-- --------------------------------------------------------

--
-- Table structure for table `top10k`
--

CREATE TABLE IF NOT EXISTS `top10k` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `url` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `rank` int(10) unsigned NOT NULL,
  `site` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d6` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d5` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d4` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d3` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d2` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d1` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d0` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `path` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `tldtype` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `country` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `language` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `Updated_By` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `Updated_On` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rank` (`rank`),
  KEY `url` (`url`(255)),
  KEY `d0` (`d0`),
  KEY `d1` (`d1`),
  KEY `d2` (`d2`),
  KEY `d3` (`d3`),
  KEY `d4` (`d4`),
  KEY `d5` (`d5`),
  KEY `d6` (`d6`),
  KEY `site` (`site`),
  KEY `tldtype` (`tldtype`),
  KEY `country` (`country`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=509763 ;
